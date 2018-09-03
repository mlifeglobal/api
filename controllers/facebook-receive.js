module.exports = (Bluebird, twilio, request, config) => ({
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

    if (params['hub.verify_token'] !== process.env.facebookVerifyToken) {
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
