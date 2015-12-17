var config = module.exports = {
  url: 'https://developer.github.com/v3/',
  urlRegex: /^https:\/\/developer.github.com\/v3/,
  protocols: ['https'],
  host: 'api.github.com',
  basePath: '/',
  title: 'GitHub API',
  description: 'The GitHub API',
  operations: {selector: '.content'},
  operation: {selector: 'h2 ~ pre:not(.highlight)'},
  path: {selector: 'h2 ~ pre:not(.highlight)', regex: /\w+ (\/\S*)/, sibling: true},
  method: {selector: 'h2 ~ pre:not(.highlight)', regex: /(\w+) .*/, sibling: true},
  parameters: {selector: 'table', sibling: true},
  parameter: {selector: 'tr'},
  parameterName: {selector: 'td:first-of-type', regex: /(\S+)/},
  parameterType: {selector: 'td:nth-of-type(2)'},
  parameterDescription: {selector: 'td:nth-of-type(3)'},
  requestBody: {selector: 'h4:contains(Example) ~ pre.highlight-json', isExample: true, sibling: true},
  responses: {selector: 'h3:contains(Response)', sibling: true},
  responseStatus: {selector: 'pre.highlight-headers', regex: /Status: (\d+) /, sibling: true},
  responseDescription: {selector: 'pre.highlight-headers', regex: /Status: \d+ (.*)/, sibling: true},
  responseSchema: {selector: 'pre.highlight-json', isExample: true, sibling: true},

  extractPathParameters: function(path) {
    pieces = path.split('/');
    pieces = pieces.map(function(p) {
      return p.replace(/:(\w+)/g, '{$1}')
    })
    return pieces.join('/');
  }
}
