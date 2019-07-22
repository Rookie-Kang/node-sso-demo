const os = require('os')

// 获取本地IP地址
function getIPAdress() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces ) {
    const interface = interfaces[interfaceName];
    for (let i = 0; i < interface.length; i++) {
      const item = interface[i];
      if (item.family === 'IPv4' && item.address !== '127.0.0.1' && !item.intermal) {
        return item.address;
      }
    }
  }
}

exports.IPAdress = getIPAdress();
