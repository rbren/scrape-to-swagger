var config = module.exports = {
  url: 'https://libraries.io/api',
  depth: 0,
  protocols: ['https'],
  host: 'libraries.io',
  basePath: '/api',
  title: 'Libraries.io',
  description: 'Libraries.io monitors 1,135,092 open source libraries across 29 different package managers. You can discover new libraries to use in your software projects as well as be notified of new releases to keep your applications secure and up to date.',
  operation: {selector: 'h3[id]', split: true},
  operationDescription: {selector: 'h3[id] + p'},
  path: {selector: 'h3 + p ~ p > code:contains(GET)', regex: /\w+ https:\/\/libraries.io\/api(\/\S*)/},
  method: {selector: 'h3 + p ~ p > code:contains(GET)', regex: /(\w+) .*/},

  parameters: {selector: 'code:contains(page)'},
  parameterName: 'page',
  parameterType: 'string',
  parameterDescription: 'The page of results to return',

  responseSchema: {selector: 'hr + p:contains(Example) pre', isExample: true},

  fixPathParameters: function(path) {
    pieces = path.split('/');
    pieces = pieces.map(function(p) {
      return p.replace(/:(\w+)/g, '{$1}')
    })
    return pieces.join('/');
  }
}

config.securityDefinitions = {
  apiKey: {
    type: 'apiKey',
    in: 'query',
    name: 'api_key',
  }
}
