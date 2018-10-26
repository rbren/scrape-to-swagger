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
    var optional = path.match(/\/\[(.*)\]/);
    if (optional) {
      optional = optional[1];
      var withoutOption = path.replace('/[' + optional + ']', '');
      var withOption = path.replace('/[', '').replace(']', '');
      paths.push(withoutOption);
      paths.push(withOption);
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

config.securityDefinitions = {
  "OAuth": {
    "type": "oauth2",
    "flow": "accessCode",
    "authorizationUrl": "https://www.reddit.com/api/v1/authorize",
    "tokenUrl": "https://www.reddit.com/api/v1/access_token",
    "scopes": {
      "creddits": "Spend my reddit gold creddits on giving gold to other users.",
      "modcontributors": "Add/remove users to approved submitter lists and ban/unban or mute/unmute users from subreddits I moderate.",
      "modconfig": "Manage the configuration, sidebar, and CSS of subreddits I moderate.",
      "subscribe": "Manage my subreddit subscriptions. Manage \"friends\" - users whose content I follow.",
      "wikiread": "Read wiki pages through my account",
      "wikiedit": "Edit wiki pages on my behalf",
      "vote": "Submit and change my votes on comments and submissions.",
      "mysubreddits": "Access the list of subreddits I moderate, contribute to, and subscribe to.",
      "submit": "Submit links and comments from my account.",
      "modlog": "Access the moderation log in subreddits I moderate.",
      "modposts": "Approve, remove, mark nsfw, and distinguish content in subreddits I moderate.",
      "modflair": "Manage and assign flair in subreddits I moderate.",
      "save": "Save and unsave comments and submissions.",
      "modothers": "Invite or remove other moderators from subreddits I moderate.",
      "read": "Access posts and comments through my account.",
      "privatemessages": "Access my inbox and send private messages to other users.",
      "report": "Report content for rules violations. Hide &amp; show individual submissions.",
      "identity": "Access my reddit username and signup date.",
      "livemanage": "Manage settings and contributors of live threads I contribute to.",
      "account": "Update preferences and related account information. Will not have access to your email or password.",
      "modtraffic": "Access traffic stats in subreddits I moderate.",
      "edit": "Edit and delete my comments and submissions.",
      "modwiki": "Change editors and visibility of wiki pages in subreddits I moderate.",
      "modself": "Accept invitations to moderate a subreddit. Remove myself as a moderator or contributor of subreddits I moderate or contribute to.",
      "history": "Access my voting history and comments or submissions I've saved or hidden.",
      "flair": "Select my subreddit flair. Change link flair on my submissions."
    }
  }
}

