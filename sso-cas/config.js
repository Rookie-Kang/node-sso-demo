const globalConfig = require('../config');

const { IPAdress } = globalConfig;

exports.url = `http://${IPAdress}`;

exports.port = 8888;