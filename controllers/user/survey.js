module.exports = (Bluebird, JWT, config, request) => ({
  getAll: {
    async method (ctx) {
      console.log(ctx.request)

      const {
        data: { surveys }
      } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-client-surveys`,
        body: {
          secret: process.env.apiSecret,
          data: { clientID: 1 }
        },
        json: true
      })

      ctx.body = {surveys}
    }}
})
