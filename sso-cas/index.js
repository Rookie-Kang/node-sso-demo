const fs = require('fs');
const Koa = require('koa');
const session = require('koa-session2');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const TokenGenerator = require('./token-generator');
const cors = require('koa2-cors');

const help = require('./help');
const config = require('./config');
const Store = require('./redisStore');
const acctService = require('./service/acctService');

const app = new Koa();
const router = new Router();
const store = new Store();
const { handleDomain } = help;
const { url, port } = config;

const secretOrPrivateKey = 'service-sso';
const secretOrPublicKey = 'service-sso';
const options = {
  algorithm: 'HS256',
  noTimestamp: false,
  expiresIn: '3h',
};
const sessionConfig = {
  key: 'sid',
  store
};

const tokenGenerator = new TokenGenerator(secretOrPrivateKey, secretOrPublicKey, options);

app.use(async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    ctx.response.status = err.statusCode || err.status || 400;
    ctx.response.body = {
      status: 1,
      message: err.message
    };
  }
});

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));

app.use(cors());

app.use(session(sessionConfig));

router.get('/', (ctx, next) => {
  ctx.body = 'ok!';
});

// 登陆页面
router.get('/login-page', async (ctx, next) => {
  const sid = ctx.cookies.get('sid');
  console.log('sid', sid);
  if (!sid) {
    const body = fs.readFileSync('./page/index.html', 'utf-8');
    ctx.body = body;
  } else {
    const userData = await store.get(sid) || {};
    console.log('userData', userData);
    const { redirectUrl } = ctx.query;
    const redirectUrlDomain = handleDomain(redirectUrl);
    if (Object.keys(userData).length === 0) {
      ctx.session = null;
      ctx.redirect(`${url}:${port}/login-page${ctx.search}`);
    } else {
      const token = tokenGenerator.sign({ userId: userData.userId, sid });
      ctx.response.redirect(`${redirectUrlDomain}/cas/attach${ctx.search}&&jwt=${token}`);
    }
  }
});

// 登陆请求
router.post('/login', async (ctx, next) => {
  const { body } = ctx.request;
  const { redirectUrl } = ctx.query;
  const redirectUrlDomain = handleDomain(redirectUrl);
  const result = acctService.verifyUser(body);
  // 校验账户信息
  if (!result) {
    throw new Error('账号密码错误');
  }
  // 设置token和session
  ctx.session.userId = result;
  const sid = store.setSid();
  ctx.sid = sid;
  const token = tokenGenerator.sign({ userId: result, sid });
  console.log('redirectUrlDomain', redirectUrlDomain);
  ctx.response.redirect(`${redirectUrlDomain}/cas/attach${ctx.search}&&jwt=${token}`);
});

// 校验jwt 返回session数据
router.get('/validate', async (ctx, next) => {
  const { jwt } = ctx.query;
  if (!jwt) {
    throw new Error('jwt 不存在');
  }
  const info = tokenGenerator.verify(jwt);
  const userData = await store.get(info.sid);
  if (!userData) {
    ctx.body = {
      status: 1,
      message: 'session 过期或者不存在'
    }
  } else {
    ctx.body = {
      status: 0,
      message: '验证成功',
      data: userData
    };
  }
});

// 登出
router.get('/logout', async (ctx, next) => {
  ctx.session = null;
  const { redirectUrl } = ctx.query;
  ctx.response.redirect(`${url}:${port}/login-page?redirectUrl=${redirectUrl}`);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

// 全局错误处理
app.on('error', async (err, ctx) => {
  console.log('service error:', err.message);
});

app.listen(port, () => {
  console.log(`service started! port ${port}`);
});