var config = module.exports = {
  url: 'https://webservices.i-parcel.com/Help',
  host: 'webservices.i-parcel.com',
  basePath: '/api',
  title: 'UPS i-parcel API',
  description: {selector: ''},
  operation: {selector: '.content-wrapper.main-content'},
  operationSummary: {selector: 'h1 + div > p'},
  path: {selector: 'h1', regex: /\w+ (.*)/},
  method: {selector: 'h1', regex: /(\w+) .*/},
  parameters: {selector: 'h2:contains() ~ table'},
  parameter: {selector: 'tr'},
  parameterName: {selector: 'td:first-of-type', regex: /(\w+)( required)?/},
  parameterDescription: {selector: 'td:nth-of-type(2)'},
  requestBody: {selector: 'h3:nth-of-type(1) + h4 + pre + h4 + pre + h4 + pre', isExample: true},
  responseStatus: {selector: 'h3:nth-of-type(2) + h4 + pre', regex: /(\d+) .*/},
  responseDescription: {selector: 'h3:nth-of-type(2) + h4 + pre', regex: /\d+ (.*)/},
  responseSchema: {selector: 'h3:nth-of-type(2) + h4 + pre + h4 + pre + h4 + pre', isExample: true},
  
  fixPathParameters: function(path) {
    var pieces = path.split('/');
    var params = [];
    pieces.forEach(function(piece) {
      var match = piece.match(/^(\d+)$/) || piece.match(/l33thaxor/);
      if (match)  {
        path = path.replace('/' + match[0], '/{id}');
        return;
      }
      if (piece === 'games' || piece === 'tech' || piece === 'books' || piece === 'podcasts') {
        path = path.replace(piece, '{category}');
      }
    })
    return path;
  },
}
