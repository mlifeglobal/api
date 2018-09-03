module.exports = (request, config, africasTalking) => ({
  receive: {
    async method (ctx) {
      const {
        from: phone,
        id: messageIdentifier,
        text: message
      } = ctx.request.body

      const {
        data: { reply }
      } = await request.post({
        uri: `${config.constants.URL}/admin/filler-process`,
        body: {
          secret: process.env.apiSecret,
          data: {
            identifier: phone,
            message,
            platform: 'sms',
            messageIdentifier
          }
        },
        json: true
      })

      if (reply) {
        await request.post({
          uri: `${config.constants.URL}/africas-talking-send`,
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

  send: {
    schema: [['data', true, [['message', true], ['phone', true]]]],
    async method (ctx) {
      const {
        data: { message, phone }
      } = ctx.request.body

      const res = await africasTalking.SMS.send({
        from: process.env.africasTalkingShortcode,
        to: phone,
        message,
        enqueue: true
      })

      ctx.body = {}
    }
  },

  sendAirtime: {
    schema: [['data', true, [['phone', true], ['amount', true]]]],
    async method (ctx) {
      const {
        data: { amount, phone }
      } = ctx.request.body

      const res = await africasTalking.AIRTIME.send({
        recipients: [
          {
            phoneNumber: phone,
            amount
          }
        ]
      })

      ctx.body = {}
    }
  }
})
