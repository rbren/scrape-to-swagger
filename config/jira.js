const VALID_TYPES = ['string', 'boolean', 'integer', 'number', 'object', 'array'];

var config = module.exports = {
  url: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3',
  depth: 0,
  protocols: ['https'],
  host: 'jira.atlassian.com',
  basePath: '/rest/api/3',
  title: 'Jira',
  version: 'v3',
  description: 'The Jira Cloud Platform REST API',
  securityDefinitions: {
    "Basic": {
      "type": "basic"
    },
    "OAuth": {
      "type": "oauth2",
      "flow": "accessCode",
      "authorizationUrl": "https://auth.atlassian.com/authorize?prompt=true&audience=api.atlassian.com",
      "tokenUrl": "https://auth.atlassian.com/oauth/token",
      "scopes": {
        "read:jira-user": "View user information in Jira that the user has access to, including usernames, email addresses, and avatars",
        "read:jira-work": "Read Jira project and issue data, search for issues and objects associated with issues like attachments and worklogs",
        "write:jira-work": "Create and edit issues in Jira, post comments as the user, create worklogs, and delete issues",
        "manage:jira-project": "Create and edit project settings and create new project-level objects (for example, versions and components)",
        "manage:jira-configuration": "Take Jira administration actions (for example, create projects and custom fields, view workflows, and manage issue link types)",
      }
    }
  },
  operations: {selector: '.sc-dliRfk.eavRJA'},
  operation: {selector: 'section.sc-fjmCvl.cblxYq'},
  operationDescription: {selector: 'p + div p'},
  path: {selector: '.sc-dTdPqK.QlTmF', regex: /\w+\s+\/rest\/api\/3(\/\S*)/},
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
