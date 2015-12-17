var config = module.exports = {
  url: 'https://api.producthunt.com/v1/docs/',
  host: 'api.producthunt.com',
  basePath: '/v1',
  title: 'Product Hunt API',
  description: {selector: ''},
  operation: {selector: '.api--content'},
  path: {selector: '.api--request pre:first-of-type', regex: /\w+ (.*)/, regexMatch: 1},
  method: {selector: '.api--request pre:first-of-type', regex: /(\w+) .*/, regexMatch: 1},
}
