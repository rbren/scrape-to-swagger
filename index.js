var METHODS = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options'];
var CREATE_METHODS = ['post', 'patch', 'put'];
var getDefaultParameterLocation = function(method) {
  if (method === 'post' || method === 'patch' || method === 'put') return 'formData';
  return 'query';
}

var deepSort = require('deep-sort-object');
var urlParser = require('url');
var fs = require('fs');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var generateSchema = require('json-schema-generator');
var argv = require('yargs').argv;
if (argv.name) {
  argv.config = __dirname + '/config/' + argv.name + '.js';
  argv.output = __dirname + '/output/' + argv.name + '.swagger.json';
}
var config = require(argv.config);
let locs = config.defaultParameterLocations = config.defaultParameterLocations || {};
METHODS.forEach(m => locs[m] = locs[m] || getDefaultParameterLocation(m));

var swagger = {
  swagger: '2.0',
  paths: {},
  info: {},
  host: config.host,
  basePath: config.basePath,
  securityDefinitions: config.securityDefinitions,
};

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
    var info = ['title', 'description', 'version'];
    base.forEach(function(i) {swagger[i] = extractText(body, config[i])})
    info.forEach(function(i) {swagger.info[i] = extractText(body, config[i])})
    swagger.schemes = config.schemes || ['https'];
    callback();
  })
}

var scrapedPages = [];

function scrapePage(url, depth, callback) {
  url = urlParser.resolve(host, url);
  if (url.indexOf('mailto:') === 0) return callback();
  if (scrapedPages.indexOf(url) !== -1) return callback();
  if (config.urlRegex && !url.match(config.urlRegex)) return callback();
  scrapedPages.push(url);
  log('scrape', url);
  request.get(url, function(err, resp, body) {
    if (err) return callback(err);
    var $ = cheerio.load(body);
    addPageToSwagger($);
    if (!depth) return callback();
    var links = $('a[href]');
    async.series($('a[href]').map(function(i, el) {
      return function(acb) {
        scrapePage($(el).attr('href'), depth - 1, acb);
      }
    }), function(err) {
      callback(err);
    })
  })
}

function addPageToSwagger($) {
  var body = $('body');
  operations = resolveSelector(body, config.operations, $);
  operations = resolveSelector(operations, config.operation, $);
  operations.each(function() {
    var op = $(this);
    var method = extractText(op, config.method);
    var path = extractText(op, config.path);
    log('  op', method, path);
    if (!method || !path) return;
    method = method.toLowerCase();
    if (METHODS.indexOf(method) === -1) return;
    var parsed = urlParser.parse(path, true);
    path = parsed.pathname;
    if (!path.startsWith('/')) path = '/' + path;
    if (config.fixPathParameters) path = config.fixPathParameters(path, $, resolveSelector(op, config.path));
    var paths = Array.isArray(path) ? path : [path];
    paths.forEach(function(path) {
      addOperationToSwagger($, op, method, path, parsed.query);
    });
  });
}

function addOperationToSwagger($, op, method, path, qs) {
  var sPath = swagger.paths[path] = swagger.paths[path] || {};
  var sOp = sPath[method] = sPath[method] || {parameters: [], responses: {}};
  sOp.summary = extractText(op, config.operationSummary) || undefined;
  sOp.description = extractText(op, config.operationDescription) || undefined;
  for (var key in qs) {
    sOp.parameters.push({
      name: key,
      type: 'string',
      in: 'query',
    })
  }

  var parameters = resolveSelector(op, config.parameters, $);
  parameters = resolveSelector(parameters, config.parameter, $);
  let bodyParam = null;
  var body = extractJSON(op, config.requestBody);
  if (body) {
    log('    param', 'body');
    bodyParam = {name: 'body', in: 'body', schema: body};
  }
  if (parameters) parameters.each(function() {
    var param = $(this);
    var name = extractText(param, config.parameterName);
    log('    param', name);
    if (!name) return;
    var sParameter = {name: name};
    var description = extractText(param, config.parameterDescription);
    if (description) sParameter.description = description.trim();
    var required = extractBoolean(param, config.parameterRequired);
    if (required === true || required === false) sParameter.required = required;
    sParameter.type = extractText(param, config.parameterType).toLowerCase() || 'string';
    if (sParameter.type === 'array') sParameter.items = {type: 'string'}; // FIXME: add items schema extractor
    if (path.match(new RegExp('\\{' + sParameter.name + '\\}'))) {
      sParameter.in = 'path';
    } else {
      sParameter.in = extractText(param, config.parameterIn) || config.defaultParameterLocations[method];
    }
    if (sParameter.in === 'field') {
      bodyParam = bodyParam || {name: 'body', in: 'body', schema: {properties: {}}};
      bodyParam.schema.properties[sParameter.name] = bodyParam.schema.properties[sParameter.name] || {type: sParameter.type};
      sParameter = null;
    }
    if (sParameter) sOp.parameters.push(sParameter);
  });
  if (bodyParam) {
    sOp.parameters.push(bodyParam);
  }

  var responses = resolveSelector(op, config.responses, $).first();
  responses = resolveSelector(responses, config.response, $);
  responses.each(function() {
    var response = $(this);
    var responseStatus = extractInteger(response, config.responseStatus) || 200;
    log('    resp', responseStatus);
    var responseDescription = extractText(response, config.responseDescription);
    var responseSchema = extractJSON(response, config.responseSchema);
    sOp.responses[responseStatus] = {
        description: responseDescription || '',
        schema: responseSchema || undefined,
    };
  });
  if (Object.keys(sOp.responses).length === 0) {
    sOp.responses.default = {'description': 'Unknown'};
  }
}

function resolveSelector(el, extractor, $) {
  if (!extractor) return el;
  if (extractor.sibling) return el.nextAll(extractor.selector).eq(0);
  if (extractor.split) {
    return el.find(extractor.selector).map(function() {
      var elementSet = $(this).nextUntil(extractor.selector).addBack().map(function() {return $.html($(this))}).toArray();
      var elementSetHTML = elementSet.join(' ');
      return $('.scrape-wrapper', '<div class="scrape-wrapper">' + elementSetHTML + '</div>');
    })
  }
  return el.find(extractor.selector);
}

function extractText(el, extractor) {
  if (!extractor) return '';
  if (typeof extractor === 'string') return extractor;
  var el = resolveSelector(el, extractor);
  var text =
        extractor.parse ? extractor.parse(el.first())
      : extractor.join ? el.map(function() {return cheerio(this).text()}).toArray().join(' ')
      : el.first().text();
  if (extractor.regex) {
    var matches = text.match(extractor.regex);
    if (!matches) return '';
    text = matches[extractor.regexMatch || 1];
  }
  return (text || '').trim();
}

function fixSchema(schema) {
  if (!schema) return schema;
  delete schema['$schema'];
  if (schema.required && !schema.required.length) delete schema.required;
  if (schema.properties) {
    for (let key in schema.properties) fixSchema(schema.properties[key]);
  }
  if (schema.items) {
    fixSchema(schema.items);
  }
  return schema;
}

function extractJSON(el, extractor) {
  var json = extractText(el, extractor);
  if (!json) return;
  try {
    json = JSON.parse(json);
  } catch (e) {
    console.log('failed to parse', json);
    json = undefined;
  }
  if (!json) return;
  if (extractor.isExample) {
    json = generateSchema(json);
    fixSchema(json);
  }
  return json;
}

function extractBoolean(el, extractor) {
  var text = extractText(el, extractor);
  if (!text) return;
  text = text.toLowerCase();
  if (text === 'false' || text === 'no') return false;
  return true;
}

function extractInteger(el, extractor) {
  var text = extractText(el, extractor);
  if (!text) return;
  return parseInt(text);
}

function fixErrors() {
  for (var path in swagger.paths) {
    for (var method in swagger.paths[path]) {
      var op = swagger.paths[path][method];
      op.parameters = op.parameters.filter(function(p) {
        var bestParamWithName = op.parameters.filter(function(p2) {
          return p2.name === p.name
        }).sort(function(p1, p2) {
          if (p1.in === 'query' && !p2.in === 'query') return 1;
          if (p2.in === 'query' && !p1.in === 'query') return -1;
          if (p1.schema && !p2.schema) return -1;
          if (p2.schema && !p1.schema) return 1;
          if (p1.type && !p2.type) return -1;
          if (p2.type && !p1.type) return 1;
          if (p1.schema && p2.schema) {
            var p1len = JSON.stringify(p1.schema).length;
            var p2len = JSON.stringify(p2.schema).length;
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
        if (origParam) {
          origParam.in = 'path';
          origParam.required = true;
        }
        else op.parameters.push({in: 'path', name: paramName, type: 'string', required: true})
      }

      var bodyParam = op.parameters.filter(function(p) {return p.in === 'body'})[0];
      if (bodyParam && bodyParam.schema) {
        var props = bodyParam.schema.properties || {};
        op.parameters = op.parameters.filter(function(p) {
          if (props[p.name]) return false;
          return true;
        })
      }
    }
  }
  if (config.fixup) config.fixup(swagger);
}

scrapeInfo(config.url, function(err) {
  if (err) throw err;
  scrapePage(config.url, config.depth === 0 ? 0 : (config.depth || 1), function(err) {
    if (err) throw err;
    fixErrors();
    fs.writeFileSync(argv.output || 'swagger.json', JSON.stringify(deepSort(swagger), null, 2));
  });
});
