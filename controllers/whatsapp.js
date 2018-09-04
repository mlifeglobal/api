module.exports = (twilio, request, config) => ({
  receive: {
    async method (ctx) {
      const { From: phone, Body: msg } = ctx.request.body
      const phoneNumber = phone.split(':')[1]

      const {
        data: { reply }
      } = await request.post({
        uri: `${config.constants.URL}/admin/filler-process`,
        body: {
          secret: process.env.apiSecret,
          data: {
            identifier: phoneNumber,
            message: msg,
            platform: 'whatsapp'
          }
        },
        json: true
      })

      if (reply) {
        await request.post({
          uri: `${config.constants.URL}/whatsapp-send`,
          body: {
            data: {
              phone,
              message: reply
            }
          },
          json: true
        })
      }

      ctx.body = {}
    }
  },

  status: {
    async method (ctx) {
      ctx.body = {}
    }
  },

  send: {
    schema: [['data', true, [['phone', true], ['message', true]]]],
    async method (ctx) {
      const {
        data: { phone, message }
      } = ctx.request.body

      twilio.messages.create({
        from: `whatsapp:${process.env.whatsappNumber}`,
        to: phone,
        body: message
      })

      ctx.body = {}
    }
  }
})
