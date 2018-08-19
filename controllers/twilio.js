module.exports = (twilio, request, config) => ({
  receive: {
    async method (ctx) {
      const requestBody = ctx.request.body
      const { From: phone, Body: msg } = requestBody

      const {
        data: { reply }
      } = await request.post({
        uri: `${config.constants.URL}/admin/filler-process`,
        body: {
          secret: process.env.apiSecret,
          data: {
            identifier: phone,
            message: msg,
            platform: 'sms'
          }
        },
        json: true
      })

      twilio.messages.create({
        from: process.env.twilioNumber,
        to: phone,
        body: reply
      })

      ctx.body = {}
    }
  }
})
