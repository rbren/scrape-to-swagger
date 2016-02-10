# scrape-to-swagger

## Usage
See the [config/ directory](config/product-hunt.js) for example configurations

```bash
npm install -g scrape-to-swagger
scrape-to-swagger --config ./config/product-hunt.js --output ./output/product-hunt.swagger.json --verbose
```

## Config

The configuration file tells scrape-to-swagger how to retrieve each piece of the swagger document from the HTML.

#### Required
* `url` - The root page to scrape
* `depth` - The depth to crawl links

#### Selectors
Selector fields correspond to parts of the Swagger document. These can be specified as constants or as selectors.
* `host`
* `basePath`
* `title`
* `description`
* `operations` - A group of operations
  * `operation` - A single operation (e.g. GET /users)
    * `path`
    * `method`
    * `operationDescription`
    * `parameters`
      * `parameter`
        * `parameterIn`
        * `parameterName`
        * `parameterRequired`
        * `parameterDescription`
    * `responses`
      * `response`
        * `responseStatus`
        * `responseDescription`
        * `responseSchema`

Selectors are passed to [cheerio](https://github.com/cheeriojs/cheerio), which is based on jQuery.

The selector object takes four parameters:
* selector - a CSS selector. This will be applied as parent.find(selector), where the parent is the element in the hierarchy above (or &lt;body&gt; if none)
* regex - A regular expression for extracting the field from the text inside the selector
* regexIndex - The index of the matched items to use (default=1, i.e. it will capture the first thing you put in parens)
* join - If true, join *all* the elements matched by the selector
* split - If true, include all siblings of the element matched by the selector, up until the next match of the selector

#### Other

* `fixPathParameters` a function for converting to Swagger-style parameters, e.g. from /users/:username to /users/{username}

```js
var config = module.exports = {
  url: 'https://www.quandl.com/docs/api',
  depth: 0,
  protocols: ['https'],
  host: 'www.quandl.com',
  basePath: '/api/v3',
  title: 'Quandl API',
  description: 'The Quandl API',

  operations: {selector: 'h2', split: true},
  operationDescription: {selector: 'h2 ~ p', join: true},
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
```
