module.exports = Bluebird => ({
  async before (ctx) {
    // Api Token checker
    const { secret } = ctx.request.body
    if (!secret || secret !== process.env.apiSecret) { return Bluebird.reject({ status: 401, errors: 'unauthorized' }) }
  }
})
