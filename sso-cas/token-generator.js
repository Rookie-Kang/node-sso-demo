const jwt = require('jsonwebtoken');

class TokenGenerator {
  constructor(secretOrPrivateKey, secretOrPublicKey, options) {
    this.secretOrPrivateKey = secretOrPrivateKey;
    this.secretOrPublicKey = secretOrPublicKey;
    this.options = options;
  }

  // 登陆
  sign(payload, signOptions) {
    const jwtSignOptions = Object.assign({}, signOptions, this.options);
    return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
  }

  // 重置token
  refresh(token, refreshOptions = {}) {
    const payload = this.verify(token, refreshOptions);
    delete payload.iat;
    delete payload.exp;
    delete payload.nbf;
    delete payload.jti;
    const jwtSignOptions = Object.assign({ }, this.options);
    return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
  }

  // 验证
  verify(token, refreshOptions = {}) {
    return jwt.verify(token, this.secretOrPublicKey, refreshOptions.verify);
  }
}

module.exports = TokenGenerator;
