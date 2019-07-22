const globalConfig = require('../config');

const { IPAdress } = globalConfig;

const ssoUrl = `http://${IPAdress}:8888`;

exports.ssoServer = {
  url: ssoUrl,
  validateUrl: `${ssoUrl}/validate`,
  loginUrl: `${ssoUrl}/login-page`,
};

exports.port = 3000;