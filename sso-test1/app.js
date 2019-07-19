const Koa = require('koa');
const app = new Koa();
const fs = require('fs');
const cors = require('koa2-cors');
const Router = require('koa-router');
const request = require('request-promise');
const config = require('./config');

let router = new Router();
const { ssoServer, port } = config;

router.get('/home', async (ctx, next) => {
  ctx.response.type = 'html';
  const { query = {} } = ctx;
  query.timestamp = Number(new Date());
  const locationUrl = ctx.request.header.host; 
  let url = ctx.url;
  const queryParams = (params) => {
    let queryString = '';
    let arr = [];
    for (let key in params) {
      if (params[key] || [false, 0].some(item => item === params[key])) {
        const value = typeof params[key] === 'string' ?
          params[key] : JSON.stringify(params[key]);
        arr.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    queryString += arr.join('&');
    return queryString;
  }

  const newQuery = queryParams(query);
  url = url.replace(/\?.*/, '');
  
  ctx.response.body = fs.createReadStream('./app.html');
  let jwtCookie = ctx.cookies.get('jwtCookie');

  if (!jwtCookie) {
    ctx.response.redirect(`${ssoServer.loginUrl}?redirectUrl=http://${locationUrl}${url}?${newQuery}`);
  } else {
    let result = await request({
      method: 'GET',
      url: `${ssoServer.validateUrl}?jwt=${jwtCookie}`,
      json: true,
    })
    if (result.status !== 0) {
      ctx.cookies.set('jwtCookie', '', { maxAge:0 });
      ctx.response.redirect(`${ssoServer.loginUrl}?redirectUrl=http://${locationUrl}${url}?${newQuery}`);
    }
  }
  next();
})

router.get('/cas/attach', async (ctx, next) => {
  ctx.body="this is crazy";
  const { jwt, redirectUrl } = ctx.query;
  if (jwt) {
    let result = await request({
      method: 'GET',
      url: `${ssoServer.validateUrl}?jwt=${jwt}`,
      json: true,
    })
   if(result.status === 0 ) {
      ctx.cookies.set('jwtCookie', jwt);
      ctx.response.redirect(`${redirectUrl}`)
   }
  } else {
    ctx.response.redirect(`${ssoServer.loginUrl}?redirectUrl=${redirectUrl}`);
  }
  next();
})

app.use(cors());
app.use(router.routes()).use(router.allowedMethods());

app.listen(port);
console.log(`端口监听在${port}`);