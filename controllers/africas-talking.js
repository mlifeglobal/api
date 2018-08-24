module.exports = (request, config) => ({
  receive: {
    async method (ctx) {
      const {
        from: phone,
        id: messageIdentifier,
        text: message
      } = ctx.request.body
      console.log({ phone, messageIdentifier, message })

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
              message
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

      const res = await request.post({
        uri: `${config.constants.AFRICAS_TALKING_API}/messaging`,
        headers: {
          Accept: 'application/json',
          apikey: process.env.africasTalkingToken
        },
        formData: {
          username: process.env.africasTalkingUsername,
          from: process.env.africasTalkingShortcode,
          to: phone,
          message
        },
        json: true
      })
      console.log(res)

      ctx.body = {}
    }
  }
})
