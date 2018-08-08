
const OAuthServer = require('oauth2-server');
const JWTHandler = require('./src/jwthandler');

const { Request, Response } = OAuthServer;

module.exports = (dataStore, configuration) => {
  const accessTokenLifetime = configuration.accessTokenExpiry || 1800;
  const refreshTokenLifetime = configuration.refreshTokenExpiry || 1209600;
  const model = new JWTHandler(dataStore, accessTokenLifetime, refreshTokenLifetime);
  const oauth = new OAuthServer({
    model,
    accessTokenLifetime,
    refreshTokenLifetime,
  });


  const handler = {};
  handler.token = (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    if (!request.body.client_secret) {
      request.body.client_secret = 'default';
    }
    if (!request.body.scope) {
      request.body.scope = 'default';
    }
    oauth.token(request, response)
      .then(() => {
        res.set(response.headers);
        res.json(response.body);
      }).catch(err => next(err));
  };

  handler.authenticate = (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    if (req.query.scope) {
      oauth.authenticate(request, response, { scope: req.query.scope })
        .then((token) => {
          Object.assign(req, { user: token });
          next();
        })
        .catch(err => next(err));
    } else {
      oauth.authenticate(request, response)
        .then((token) => {
          Object.assign(req, { user: token });
          next();
        })
        .catch(err => next(err));
    }
  };
  return handler;
};
