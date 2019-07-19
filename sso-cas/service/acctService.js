const verifyUser = (body) => {
  const { username, password } = body;
  if (username === 'admin' && password === '123') {
    return 1; // userid
  }
  return false;
};

module.exports = {
  verifyUser
};