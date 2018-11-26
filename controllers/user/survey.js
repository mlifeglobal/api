module.exports = (config, request) => ({
  getAll: {
    async method (ctx) {
      const { clientID } = ctx.request.body

      const {
        data: { surveys }
      } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-client-surveys`,
        body: {
          secret: process.env.apiSecret,
          data: { clientID }
        },
        json: true
      })

      ctx.body = { surveys }
    }
  }
})
