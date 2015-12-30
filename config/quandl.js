var config = module.exports = {
  url: 'https://www.quandl.com/docs/api',
  depth: 0,
  protocols: ['https'],
  host: 'www.quandl.com',
  basePath: '/api/v3',
  title: 'Quandl API',
  description: 'The Quandl API',

  operation: {selector: 'h2', split: true},
  path: {selector: 'pre:contains(Definition) + div + blockquote', regex: /\w+ https:\/\/www.quandl.com\/api\/v3(\/\S*)/},
  method: {selector: 'pre:contains(Definition) + div + blockquote', regex: /(\w+) https:\/\/www.quandl.com\/api\/v3\/\S*/},

  parameters: {selector: 'table', sibling: true},
  parameter: {selector: 'tr'},
  parameterName: {selector: 'td:first-of-type', regex: /(\S+)/},
  parameterType: {selector: 'td:nth-of-type(2)'},
  parameterDescription: {selector: 'td:nth-of-type(3)'},
  requestBody: {selector: 'h4:contains(Example) ~ pre.highlight-json, h3:contains(Example) ~ pre.highlight-json', isExample: true, sibling: true},
  responses: {selector: 'h3:contains(Response), h4:contains(Response)', sibling: true},
  responseStatus: {selector: 'pre.highlight-headers', regex: /Status: (\d+) /, sibling: true},
  responseDescription: {selector: 'pre.highlight-headers', regex: /Status: \d+ (.*)/, sibling: true},
  responseSchema: {selector: 'pre.highlight-json', isExample: true, sibling: true},

  fixPathParameters: function(path) {
    pieces = path.split('/');
    pieces = pieces.map(function(p) {
      return p.replace(/:(\w+)/g, '{$1}')
    })
    return pieces.join('/');
  }
}
