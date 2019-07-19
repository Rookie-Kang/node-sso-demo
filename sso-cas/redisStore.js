const Redis = require("ioredis");
const { Store } = require("koa-session2");

class RedisStore extends Store {
  constructor() {
    super();
    this.redis = new Redis();
  }

  async get(sid, ctx) {
    console.log('find sid in redis ', `SESSION:${sid}`);
    let data = await this.redis.get(`SESSION:${sid}`);
    return JSON.parse(data);
  }

  // 过期时间 一周后
  async set(session, { sid = this.getID(24), maxAge = 7 * 24 * 60 * 60 } = {}, ctx) {
    sid = ctx.sid || sid;
    try {
      await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge);
    } catch (e) {
      throw new Error(e.message);
    }
    return sid;
  }

  async destroy(sid, ctx) {
    console.log('destroy sid in redis', `SESSION:${sid}`);
    return await this.redis.del(`SESSION:${sid}`);
  }

  setSid() {
    return this.getID(24);
  }
}

module.exports = RedisStore;