
const ssoUrl = 'http://192.168.31.140:8888';

exports.ssoServer = {
  url: ssoUrl,
  validateUrl: `${ssoUrl}/validate`,
  loginUrl: `${ssoUrl}/login-page`,
};

exports.port = 4000;