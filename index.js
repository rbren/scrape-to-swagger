var urlParser = require('url');
var fs = require('fs');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var argv = require('yargs').argv;
var config = require(argv.config);

var swagger = {swagger: '2.0', paths: {}, info: {}, host: config.host, basePath: config.basePath};

var parsed = urlParser.parse(config.url);
var host = parsed.protocol + '//' + parsed.host;

function scrapePage(url, depth, callback) {
  url = urlParser.resolve(host, url);
  console.log('scrape', url);
  if (url.indexOf('mailto:') === 0) return callback();
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
  $(config.operation.selector).each(function() {
    var op = $(this);
    var path = extractText(op, config.path);
    var method = extractText(op, config.method);
    if (!method || !path) return;
    swagger.paths[path] = swagger.paths[path] || {};
    swagger.paths[path][method.toLowerCase()] = {};
  })
}

function extractText(el, extractor) {
  var text = el.find(extractor.selector).text();
  if (extractor.regex) {
    var matches = text.match(extractor.regex);
    if (!matches) return;
    text = matches[extractor.regexMatch || 0];
  }
  return text;
}

scrapePage(config.url, config.depth || 1, function(err) {
  if (err) throw err;
  fs.writeFileSync(argv.output || 'swagger.json', JSON.stringify(swagger, null, 2));
});
