var config = module.exports = {
  url: 'https://www.reddit.com/dev/api',
  depth: 0,
  protocols: ['https'],
  host: 'oauth.reddit.com',
  basePath: '/',
  title: 'Reddit',
  description: 'The Reddit API',

  operations: {selector: '.section.methods'},
  operation: {selector: '.endpoint'},
  path: {
    selector: 'h3',
    parse: function(el) {
      el = el.clone()
      el.find('.api-badge').remove();
      el.find('.method').remove();
      return el.text();
    },
  },
  method: {selector: 'h3 .method'},
  
  operationDescription: {selector: '.info .md'},

  parameters: {selector: 'table.parameters'},
  parameter: {selector: 'tr'},
  parameterName: {selector: 'th', regex: /(\S+)/},
  parameterDescription: {selector: 'td'},
  requestBody: {selector: 'tr.json-model pre code', isExample: true, sibling: true},

  fixPathParameters: function(path, $, el) {
    var paths = [];
    var optional = path.match(/\[(.*)\]/);
    if (optional) {
      optional = optional[1];
      console.log('optional', optional);
      paths.push(path.replace('[' + optional + ']', ''));
      paths.push(path.replace('[', '').replace(']', ''));
    } else {
      paths.push(path);
    }
    el.find('.placeholder').each(function() {
      var placeholder = $(this).text();
      paths = paths.map(function(path) {
        return path.replace(placeholder, '{' + placeholder + '}')
      })
    })
    return paths;
  }
}
