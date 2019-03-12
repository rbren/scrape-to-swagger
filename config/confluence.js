const VALID_TYPES = ['string', 'boolean', 'integer', 'number', 'object', 'array'];

var config = module.exports = {
  url: 'https://developer.atlassian.com/cloud/confluence/rest',
  depth: 0,
  protocols: ['https'],
  "host": "myhost:port",
  "basePath": "/rest/api",
  title: 'Confluence',
  version: 'v1',
  description: 'The Confluence Cloud REST API',
  "securityDefinitions": {
    "HTTP Basic": {
      "type": "basic"
    }
  },
  operations: {selector: '.sc-dliRfk.eavRJA'},
  operation: {selector: 'section.sc-fjmCvl.cblxYq'},
  operationDescription: {selector: 'p + div p'},
  path: {selector: '.sc-dTdPqK.QlTmF', regex: /\w+\s+\/wiki\/rest\/api(\/\S*)/},
  method: {selector: '.sc-dTdPqK.QlTmF', regex: /(\w+)\s+.*/},
  parameters: {selector: 'h4:contains(Request) + div'},
  parameter: {selector: 'section.sc-hMFtBS.fpdqcn'},
  parameterName: {selector: 'strong', regex: /(\S+)/},
  parameterType: {selector: 'p.sc-iQNlJl.ccMJBl', parse: el => {
    let str = el.text();
    if (str.indexOf('Array') !== -1) return 'array';
    if (VALID_TYPES.indexOf(str) === -1) return 'object';
    return str;
  }},
  parameterArrayType: {selector: 'p.sc-iQNlJl.ccMJBl', parse: el => {
    let type = el.text().match(/<(\w+)>/)[1];
    console.log(type);
    if (VALID_TYPES.indexOf(type) === -1) return 'object';
    return type;
  }},
  parameterRequeried: {selector: 'span.sc-epnACN.fIVUua'},
  parameterDescription: {selector: '.sc-gqPbQI.cIQxHh p'},
  parameterEnum: {selector: 'ul'},
  parameterEnumValues: {selector: 'li code'},
  requestBodyFields: {selector: '.sc-laTMn.bTMCCL .sc-hMFtBS.fpdqcn'},
  requestBodyFieldsEnum: {selector: 'p:contains(Valid values)'},
  requestBodyFieldsEnumValues: {selector: 'code'},
  responses: {selector: 'h4:contains(Responses) + div'},
  responseStatus: {selector: '.sc-exAgwC.kRFHQY[tabindex="0"] > span'},
  responseDescription: {selector: '.sc-bMvGRv.hVjuRc > p'},
  responseSchema: {selector: 'code', isExample: true},
  defaultParameterLocations: {
    get: 'query',
    delete: 'query',
    put: 'query',
    post: 'query',
    patch: 'query',
  },
}
