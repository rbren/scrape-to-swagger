var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var argv = require('yargs').argv;
var config = require(argv.config);

var swagger = {swagger: '2.0'};

request.get(config.url, function(err, resp, body) {
  var $ = cheerio.load(body);
  for (var field in config.fields) {
    var selector = config.fields[field].selector;
    swagger[field] = $(selector).text();
  }
  fs.writeFileSync(argv.output || 'swagger.json', JSON.stringify(swagger, null, 2));
})
