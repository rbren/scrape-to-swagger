var METHODS = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options'];

var urlParser = require('url');
var fs = require('fs');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var sortObj = require('sorted-object');
var generateSchema = require('json-schema-generator');
var argv = require('yargs').argv;
var config = require(argv.config);

var swagger = {swagger: '2.0', paths: {}, info: {}, host: config.host, basePath: config.basePath};

var parsed = urlParser.parse(config.url);
var host = parsed.protocol + '//' + parsed.host;

var log = function() {
  if (argv.verbose) console.log.apply(console, arguments);
}

function scrapeInfo(url, callback) {
  request.get(url, function(err, resp, body) {
    if (err) return callback(err);
    var $ = cheerio.load(body);
    var body = $('body');
    
    var base = ['basePath', 'host']
    var info = ['title', 'description'];
    base.forEach(function(i) {swagger[i] = extractText(body, config[i])})
    info.forEach(function(i) {swagger.info[i] = extractText(body, config[i])})
    swagger.schemes = config.schemes || ['https'];
    callback();
  })
}

function scrapePage(url, depth, callback) {
  url = urlParser.resolve(host, url);
  if (url.indexOf('mailto:') === 0) return callback();
  log('scrape', url);
  request.get(url, function(err, resp, body) {
    if (err) return callback(err);
    var $ = cheerio.load(body);
    addPageToSwagger($);
    if (!depth) return callback();
    var links = $('a[href]');
    async.parallel($('a[href]').map(function(i, el) {
      return function(acb) {
        scrapePage($(el).attr('href'), depth - 1, acb);
      }
    }), function(err) {
      callback(err);
    })
  })
}

function addPageToSwagger($) {
  var operations = config.operations ? $(config.operations.selector) : $('body');
  operations = config.operation ? operations.find(config.operation.selector) : operations;
  operations.each(function() {
    var op = $(this);
    var method = extractText(op, config.method);
    var path = extractText(op, config.path);
    if (!method || !path) return;
    method = method.toLowerCase();
    if (METHODS.indexOf(method) === -1) return;
    path = urlParser.parse(path).pathname;
    if (config.extractPathParameters) path = config.extractPathParameters(path);
    log('operation', method, path);
    var sPath = swagger.paths[path] = swagger.paths[path] || {};
    var sOp = sPath[method] = sPath[method] || {parameters: [], responses: {}};
    var parameters = op.find(config.parameters.selector).find(config.parameter.selector);
    parameters = $(parameters);
    if (parameters) parameters.each(function() {
      var param = $(this);
      var name = extractText(param, config.parameterName);
      if (!name) return;
      var sParameter = {name: name};
      sOp.parameters.push(sParameter);
      var description = extractText(param, config.parameterDescription);
      if (description) sParameter.description = description.trim();
      sParameter.in = extractText(param, config.parameterIn) || 'query';
      sParameter.type = extractText(param, config.parameterType) || 'string';
    });
    var body = extractJSON(op, config.requestBody);
    if (body) {
      sOp.parameters.unshift({name: 'body', in: 'body', schema: body});
    }
    var responses = config.responses ? op.find(config.responses.selector) : op;
    var response = config.response ? responses.find(config.response.selector) : responses;
    var responseStatus = extractText(response, config.responseStatus);
    if (responseStatus) {
      var responseDescription = extractText(response, config.responseDescription);
      var responseSchema = extractJSON(response, config.responseSchema);
      responseStatus = parseInt(responseStatus);
      sOp.responses[responseStatus] = {
          description: responseDescription || '',
          schema: responseSchema || undefined,
      };
    }
  })
}

function extractText(el, extractor) {
  if (!extractor) return '';
  if (typeof extractor === 'string') return extractor;
  var text = extractor.sibling ? el.nextAll(extractor.selector).text() : el.find(extractor.selector).text();
  if (extractor.regex) {
    var matches = text.match(extractor.regex);
    if (!matches) return;
    text = matches[extractor.regexMatch || 1];
  }
  return text;
}

function extractJSON(el, extractor) {
  var json = extractText(el, extractor);
  if (!json) return;
  try {
    json = JSON.parse(json);
  } catch (e) {
    json = undefined;
  }
  if (!json) return;
  if (extractor.isExample) json = generateSchema(json);
  return json;
}

function fixErrors() {
  for (var path in swagger.paths) {
    for (var method in swagger.paths[path]) {
      var op = swagger.paths[path][method];
      op.parameters = op.parameters.filter(function(p) {
        var bestParamWithName = op.parameters.filter(function(p2) {
          return p2.name === p.name
        }).sort(function(p1, p2) {
          if (p1.schema && !p2.schema) return -1;
          if (p2.schema && !p1.schema) return 1;
          if (p1.type && !p2.type) return -1;
          if (p2.type && !p1.type) return 1;
          if (p1.schema && p2.schema) {
            var p1len = JSON.stringify(p1.schema).lenth;
            var p2len = JSON.stringify(p2.schema).lenth;
            if (p1len > p2len) return -1;
            if (p1len < p2len) return 1;
          }
          return 0;
        })[0];
        return p === bestParamWithName;
      }).sort(function(p1, p2) {
        if (p1.name < p2.name) return -1;
        if (p1.name > p2.name) return 1;
        return 0;
      })
      var processedPath = path;
      while (match = /{([^}]*?)}/.exec(processedPath)) {
        var paramName = match[1];
        processedPath = processedPath.replace(match[0], paramName);
        var origParam = op.parameters.filter(function(p) {return p.name === paramName})[0];
        if (origParam) origParam.in = 'path';
        else op.parameters.push({in: 'path', name: paramName, type: 'string'})
      }
    }
  }
  swagger = sortObj(swagger);
  swagger.paths = sortObj(swagger.paths);
  for (var path in swagger.paths) {
    swagger.paths[path] = sortObj(swagger.paths[path]);
  }
}

scrapeInfo(config.url, function(err) {
  if (err) throw err;
  scrapePage(config.url, config.depth === 0 ? 0 : (config.depth || 1), function(err) {
    if (err) throw err;
    fixErrors();
    fs.writeFileSync(argv.output || 'swagger.json', JSON.stringify(swagger, null, 2));
  });
});
