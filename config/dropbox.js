var config = module.exports = {
  url: 'https://www.dropbox.com/developers-v1/core/docs',
  urlRegex: /^https:\/\/www.dropbox.com\/developers-v1\/core\/docs/,
  protocols: ['https'],
  host: 'api.dropboxapi.com',
  basePath: '/1',
  title: 'DropBox API',
  description: 'The DropBox API',

  operations: {selector: '#api-specification'},
  operation: {selector: '.section.toc-el'},
  path: {selector: 'h3.method-title', regex: /(\/\S*)/},
  method: {selector: 'dl dt:contains(Method) + dd', regex: /(\w+)/},
  parameters: {selector: 'dl dt:contains(Parameters) + dd > ul.parameters'},
  parameter: {selector: 'li'},
  parameterName: {selector: 'span.param'},
  parameterDescription: {selector: ''},

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
