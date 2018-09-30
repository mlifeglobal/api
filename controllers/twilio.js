module.exports = (twilio, request, config) => ({
  receive: {
    async method (ctx) {
      const { From: phone, To: mlifePhone, Body: msg } = ctx.request.body

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

      if (reply) {
        await request.post({
          uri: `${config.constants.URL}/twilio-send`,
          body: {
            data: {
              phone,
              from: mlifePhone,
              message: reply
            }
          },
          json: true
        })
      }

      ctx.body = {}
    }
  },

  send: {
    schema: [['data', true, [['phone', true], ['from'], ['message', true]]]],
    async method (ctx) {
      const {
        data: { phone, from: mlifePhone, message }
      } = ctx.request.body

      twilio.messages.create({
        from: mlifePhone || process.env.twilioCanadaNumber,
        to: phone,
        body: message
      })

      ctx.body = {}
    }
  }
})
