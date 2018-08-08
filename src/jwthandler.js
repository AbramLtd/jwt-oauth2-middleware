const JWT = require('jsonwebtoken');
const autoBind = require('auto-bind');

module.exports = class Model {
  constructor(dataStore, accessTokenExpiry, refreshTokenExpiry) {
    this.getClientById = dataStore.getClientById;
    this.accessTokenExpiry = accessTokenExpiry;
    this.refreshTokenExpiry = refreshTokenExpiry;
    this.revokeRefreshToken = dataStore.revokeRefreshToken;
    this.getUserData = dataStore.getUserData;
    this.generateTokenData = dataStore.generateTokenData;
    this.validateScopeUser = dataStore.validateScopeUser;
    this.saveTokens = dataStore.saveToken;
    this.verifyScopeAccessToken = dataStore.verifyScopeAccessToken;
    autoBind(this);
  }

  async generateAccessToken(client, user, scope, callback) {
    try {
      const expireDate = new Date();
      let payload = {
        clientId: client.id,
        userId: user.id,
        type: 'accessToken',
      };
      const userAdditionalData = await this.generateTokenData(client, user, scope);
      payload = Object.assign({}, payload, userAdditionalData);
      const secret = client.accessTokenSecret;
      expireDate.setSeconds(expireDate.getSeconds() + this.accessTokenExpiry);

      payload.expireDate = expireDate.getTime();
      const token = JWT.sign(payload, secret, { expiresIn: this.accessTokenExpiry });
      callback(null, token);
    } catch (e) {
      callback(true, e);
    }
  }

  async generateRefreshToken(client, user, scope, callback) {
    try {
      const expireDate = new Date();
      let payload = {
        clientId: client.id,
        userId: user.id,
        type: 'refreshToken',
      };
      const userAdditionalData = await this.generateTokenData(client, user, scope);

      payload = Object.assign({}, payload, userAdditionalData);
      const secret = client.refreshTokenSecret;
      expireDate.setSeconds(expireDate.getSeconds() + this.refreshTokenExpiry);
      payload.expireDate = expireDate.getTime();

      const token = JWT.sign(payload, secret, { expiresIn: this.refreshTokenExpiry });
      callback(null, token);
    } catch (e) {
      callback(true, e);
    }
  }

  async getClient(clientId, clientSecret, callback) {
    try {
      const clientData = await this.getClientById(clientId);
      callback(null, clientData);
    } catch (e) {
      callback(true, e);
    }
  }

  async getUser(username, password, callback) {
    try {
      const userData = await this.getUserData(username, password);
      callback(null, userData);
    } catch (e) {
      callback(true, e);
    }
  }

  async revokeToken(token, callback) {
    try {
      const success = await this.revokeRefreshToken(token);
      callback(null, success);
    } catch (e) {
      callback(true, e);
    }
  }

  async getAccessToken(bearerToken, callback) {
    let client;
    try {
      const { clientId } = JWT.decode(bearerToken);
      client = await this.getClientById(clientId);
    } catch (err) {
      return callback(err, false);
    }
    return JWT.verify(bearerToken, client.accessTokenSecret, (err, decoded) => {
      if (err) {
        return callback(err, false);
      }
      const payload = {
        user: { id: decoded.userId },
        token: {
          accessToken: bearerToken,
          accessTokenExpiresAt: new Date(decoded.expireDate),
          client,
          scope: decoded.scope,
        },
        accessTokenExpiresAt: new Date(decoded.expireDate),
        scope: decoded.scope,
      };
      return callback(null, payload);
    });
  }

  async getRefreshToken(bearerToken, callback) {
    let client;
    try {
      const { clientId } = JWT.decode(bearerToken);
      client = await this.getClientById(clientId);
    } catch (err) {
      return callback(err, false);
    }
    return JWT.verify(bearerToken, client.refreshTokenSecret, (err, decoded) => {
      if (err) {
        return callback(err, false);
      }
      const payload = {
        user: { id: decoded.userId },
        client: { id: client.id },
        token: {
          refreshToken: bearerToken,
          refreshTokenExpiresAt: new Date(decoded.expireDate),
          client,
          scope: decoded.scope,
        },
        refreshTokenExpiresAt: new Date(decoded.expireDate),
        scope: decoded.scope,
      };
      return callback(null, payload);
    });
  }

  async saveToken(token, client, user, callback) {
    try {
      const success = await this.saveTokens(token, client, user);
      callback(null, success);
    } catch (e) {
      callback(true, e);
    }
  }

  async validateScope(user, client, scope, callback) {
    try {
      const validationResult = await this.validateScopeUser(user, client, scope);
      callback(null, validationResult);
    } catch (e) {
      callback(true, e);
    }
  }

  async verifyScope(accessToken, scope, callback) {
    try {
      const validationResult = await this.verifyScopeAccessToken(accessToken, scope);
      callback(null, validationResult);
    } catch (e) {
      callback(true, e);
    }
  }
};
