var urlParser = require('url');
var fs = require('fs');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var argv = require('yargs').argv;
var config = require(argv.config);

var swagger = {swagger: '2.0'};

var parsed = urlParser.parse(config.url);
var host = parsed.protocol + '//' + parsed.host;

function scrapePage(url, depth, callback) {
  console.log('resolve', host, url);
  url = urlParser.resolve(host, url);
  console.log('scrape', url);
  request.get(url, function(err, resp, body) {
    if (err) return callback(err);
    var $ = cheerio.load(body);
    for (var field in config.fields) {
      var selector = config.fields[field].selector;
      swagger[field] = $(selector).text();
    }
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

scrapePage(config.url, config.depth || 1, function(err) {
  if (err) throw err;
  fs.writeFileSync(argv.output || 'swagger.json', JSON.stringify(swagger, null, 2));
});
