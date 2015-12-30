var config = module.exports = {
  url: 'https://www.quandl.com/docs/api',
  depth: 0,
  protocols: ['https'],
  host: 'www.quandl.com',
  basePath: '/api/v3',
  title: 'Quandl API',
  description: 'The Quandl API',

  operations: {selector: 'h2', split: true},
  path: {selector: 'pre:contains(Definition) + div + blockquote', regex: /\w+ https:\/\/www.quandl.com\/api\/v3(\/\S*)/},
  method: {selector: 'pre:contains(Definition) + div + blockquote', regex: /(\w+) https:\/\/www.quandl.com\/api\/v3\/\S*/},

  parameters: {selector: 'table'},
  parameter: {selector: 'tr'},
  parameterIn: 'query',
  parameterType: 'string',
  parameterName: {selector: 'td:first-of-type', regex: /(\S+)/},
  parameterRequired: {selector: 'td:nth-of-type(2)'},
  parameterDescription: {selector: 'td:nth-of-type(3)'},

  responseSchema: {selector: 'pre:contains(Example Response) + div + blockquote', isExample: true},

  fixPathParameters: function(path) {
    pieces = path.split('/');
    pieces = pieces.map(function(p) {
      return p.replace(/:(\w+)/g, '{$1}')
    })
    return pieces.join('/');
  }
}

config.securityDefinitions = {
  'apiKey': {
    type: 'apiKey',
    name: 'api_key',
    in: 'query',
  }
}
