# JWT OAUTH Middleware

This project defines some middleware for the creation of OAuth Server using oauth2-node.
An example is given using express as the intended server.
Currently only password and refresh_token grants are supported.

## Usage & routes

Short usage version (example with **express.js** server):
```javascript
    var oauth = require('insert-package-name')(model, config); // creating server middleware
    ... // express needed stuff

    app.post('/oauth/token', oauth.token); // (1) and (2)

    app.get('/validate', oauth.authenticate, function (req, res) { // (3)
        res.json({ message: 'Secure data' });
    });

```

Any OAuth server that implements password and refresh_token grant types, needs to have three routes:
- one for generating access tokens (1) 
- one for generating new access tokens from unexpired refresh tokens (2)
- one for token validation/gathering sensitive information (3)

### Generating access tokens

Usually, the route for acquiring an access token for a user is **/token**.
The request needs to be **HTTP/HTTPS POST** and required data is sent in the request's body. 

|Required data| Value|
| ------------------ | ---------------- |
|username| user's account username|
|client_id| Id of the client (application) that is requesting the user's access token|
|password| user's account password|
|grant_type|**password** |
|client_secret|client's secret used to sign token data|
|scope|the scope the generated access token needs to have|

The return value example is shown below.

```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IjEyMzUiLCJ1c2VySWQiOiI1OGVkMDUwYTczNGQxZDBlNjVmYzc3OTQiLCJ0eXBlIjoiYWNjZXNzVG9rZW4iLCJ1c2VybmFtZSI6IkRhbmEiLCJiYW5hbmEiOiJiYW5hbmEgd2hvIiwic2NvcGUiOiJiYW5hbmEiLCJleHBpcmVEYXRlIjoxNDk4MzI4MjY3NDc2LCJpYXQiOjE0OTgzMjgyMDcsImV4cCI6MTQ5ODMyODI2N30.KygbmACDVPYGoDpUg7YiyI5oAzQ5aUv8uqG0m9BDNg4",
        "token_type": "Bearer",
        "expires_in": 59, // seconds 
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IjEyMzUiLCJ1c2VySWQiOiI1OGVkMDUwYTczNGQxZDBlNjVmYzc3OTQiLCJ0eXBlIjoicmVmcmVzaFRva2VuIiwidXNlcm5hbWUiOiJEYW5hIiwiYmFuYW5hIjoiYmFuYW5hIHdobyIsInNjb3BlIjoiYmFuYW5hIiwiZXhwaXJlRGF0ZSI6MTQ5ODMyODI2NzQ3OCwiaWF0IjoxNDk4MzI4MjA3LCJleHAiOjE0OTgzMjgyNjd9.milncP0uopHUEU56ZqG1i9IDKDkP5ANfPQPFazMZLTE",
        "scope": "banana"
    }
```

### Generating new access tokens from unexpired refresh tokens

Usually, the route for acquiring an access token for a user is **/token**.
The request needs to be **HTTP/HTTPS POST** and required data is sent in the request's body. 

|Required data| Value|
| ------------------ | ---------------- |
|client_id| Id of the client (application) that is requesting the refresh of the user's access token|
|grant_type|**refresh_token** |
|client_secret|client's secret used to sign data, secret of the refresh token|
|refresh_token|refresh token used to retrieve the new access and refresh token. Musn't be expired|

**Remark:** if the token isn't expired, it will be revoked and a new pair accessToken/refreshToken will be issued.
In addition, the new generated tokens will have the same scope as the previously generated ones.
An example is shown below.

```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IjEyMzUiLCJ1c2VySWQiOiI1OGVkMDUwYTczNGQxZDBlNjVmYzc3OTQiLCJ0eXBlIjoiYWNjZXNzVG9rZW4iLCJ1c2VybmFtZSI6IkRhbmEiLCJiYW5hbmEiOiJiYW5hbmEgd2hvIiwic2NvcGUiOiJiYW5hbmEiLCJleHBpcmVEYXRlIjoxNDk4MzI5MTY3OTkxLCJpYXQiOjE0OTgzMjkxMDcsImV4cCI6MTQ5ODMyOTE2N30._vbYF3f1DIcuiG_nX-8clYX6IgckIqY9n75NoLzw3tE",
        "token_type": "Bearer",
        "expires_in": 59, // seconds
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IjEyMzUiLCJ1c2VySWQiOiI1OGVkMDUwYTczNGQxZDBlNjVmYzc3OTQiLCJ0eXBlIjoicmVmcmVzaFRva2VuIiwidXNlcm5hbWUiOiJEYW5hIiwiYmFuYW5hIjoiYmFuYW5hIHdobyIsInNjb3BlIjoiYmFuYW5hIiwiZXhwaXJlRGF0ZSI6MTQ5ODMyOTE2Nzk5MywiaWF0IjoxNDk4MzI5MTA3LCJleHAiOjE0OTgzMjkxNjd9.GQU0bCFlu_qCuQgZtdTXTie6SPA08xVIv5Zv93ELFig",
        "scope": "banana"
    }
```

### Token validation/gathering sensitive information

For validating the token or gathering sensitive information one must issue a **HTTP GET** request on a desired route.
If scope should be validated, the request should have scope specified in the URL query.
Query parameter's name is **scope**.



## Model

In order to create the middleware object one must supply the model object and configuration.
However, not all model functions need to be provided - partial functionality is provided.
The following table shows which grant_types require which methods as well as show if the method is used in (1), (2) or (3).

|Model function name| Declaration| Description | Grant types | Needed for (1)? |  Needed for (2)? | Needed for (3)? |
| ------------------ | ---------------- | ------------------ | ---------------- | ------------------ | ---------------- |---------------- |
|**generateTokenData**| (client, user, scope) => data directly saved into the token | Same for access token and refresh token| Both | yes | yes| no|
|**getClientById**|(id) => Client : {id: string, refreshTokenSecret: string, accessTokenSecret: string} | Returns client object | Both | yes| yes| yes|
|**getUserData**|(username, password) => either (User : {id: string}) or false| Returns user object | password | yes | yes | no |
|**revokeRefreshToken**| (data) => boolean | Revokes the supplied refresh token and returns whether the operation was successful | refresh_token | no | yes | no|
|**saveToken**| (token, user, client) => Token with user and client data attached as follows {user: {id: string}, client: {id: string}} | Saves both refresh and access tokens | Both | yes | yes| no |
|**validateScopeUser**| (user, client, scope)=> either scope  or false| Used to see whether the user/client combination should/can have certain scope | password| yes | no | no|
|**verifyScopeAccessToken**|(data, scope) => boolean | Used to see whether the supplied access token can be used for the supplied scope| Authenticate method | no | no| yes|


**revokeRefreshToken data type**
```javascript
 
  data = { 
      user: {id: string},
      client: {id: string},
      token: {
                    refreshToken: string, // token
                    expires: Date,
                    client: Client,
                    scope: string
      },
      scope: string
    };
```
**verifyScopeAccessToken data type**
```javascript
 
  data = {
            user: { id: string},
            token: {
                accessToken: string, //bearerToken,
                expires: Date,
                client: Client,
                scope: string
            },
            scope: string
 };
```
 ## Config

 Config needs to define expiration in seconds for both access and refresh token.
 Example is provided below.
 ```javascript
 
  var config = {
    accessTokenExpiry: 60,             // seconds
    refreshTokenExpiry: 60,          // seconds
  };
```