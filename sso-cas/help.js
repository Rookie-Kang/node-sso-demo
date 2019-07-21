const handleDomain = (url) => {
  let urlDomain = '';
  url.replace(/(http|https|ftp|file):\/\/[A-z0-9\.:]+/img, (val) => {
    urlDomain = val;
  });
  return urlDomain;
};

exports.handleDomain = handleDomain;