module.exports = (Bluebird, Config) => ({
  type: 'get',
  async method (ctx) {
    const params = {}
    ctx.request.url
      .split('?')[1]
      .split('&')
      .forEach(param => {
        const [key, value] = param.split('=')
        params[key] = value
      })

    const config = await Config.findOne({
      where: { token: params['hub.verify_token'] }
    })
    if (!config) {
      return Bluebird.reject([
        { key: 'token', value: 'Incorrect verification code provided' }
      ])
    }

    if (params['hub.mode'] === 'subscribe') {
      ctx.body = params['hub.challenge']
      return
    }

    ctx.body = {}
  }
})
