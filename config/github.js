var config = module.exports = {
  url: 'https://developer.github.com/v3/',
  urlRegex: /^https:\/\/developer.github.com\/v3/,
  protocols: ['https'],
  host: 'api.github.com',
  basePath: '/',
  title: 'GitHub API',
  version: 'v3',
  description: 'The GitHub API',
  operations: {selector: '.content'},
  operation: {selector: 'h2 ~ pre:not(.highlight)'},
  path: {selector: 'code', regex: /\w+ (\/\S*)/},
  method: {selector: 'code', regex: /(\w+) .*/},
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
