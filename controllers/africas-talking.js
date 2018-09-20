module.exports = (request, config, africasTalking, IncentiveRecord) => ({
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

      await africasTalking.SMS.send({
        from: process.env.africasTalkingShortcode,
        to: phone,
        message,
        enqueue: true
      })

      ctx.body = {}
    }
  },

  sendAirtime: {
    schema: [
      [
        'data',
        true,
        [
          ['phones', true, 'array'],
          ['amount', true],
          ['surveyId', true, 'integer']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { amount, phones, surveyId }
      } = ctx.request.body

      let recipients = []
      for (const phoneNumber of phones) {
        recipients.push({ phoneNumber, amount })
      }

      const { responses } = await africasTalking.AIRTIME.send({
        recipients
      })

      for (const {
        errorMessage,
        phoneNumber,
        amount: amountSent,
        requestId
      } of responses) {
        IncentiveRecord.create({
          amount: amountSent,
          phone: phoneNumber,
          requestId,
          surveyId,
          status: errorMessage === 'None' ? 'Sent' : 'Failed'
        })
      }

      ctx.body = {}
    }
  },

  airtimeStatus: {
    async method (ctx) {
      const { requestId, status } = ctx.request.body

      IncentiveRecord.update({ status }, { where: { requestId } })

      if (status === 'Failed') {
        request.post({
          uri: process.env.slackWebhookURL,
          body: { text: `Airtime Send Failed for RequestID: ${requestId}` },
          json: true
        })
      }

      ctx.body = {}
    }
  },

  bulkSms: {
    schema: [['data', true, [['numbers', true, 'array'], ['message', true]]]],
    async method (ctx) {
      const {
        data: { message, numbers }
      } = ctx.request.body

      for (var phone of numbers) {
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

      ctx.body = { data: 'Bulk SMS Sent' }
    }
  },

  bulkAirtime: {
    schema: [
      [
        'data',
        true,
        [
          ['numbers', true, 'array'],
          ['incentive', true, 'integer'],
          ['currency', true],
          ['surveyId', true, 'integer']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { incentive, currency, numbers: phones, surveyId }
      } = ctx.request.body

      await request.post({
        uri: `${config.constants.URL}/africas-talking-send-airtime`,
        body: {
          data: {
            phones,
            amount: `${currency} ${incentive}`,
            surveyId
          }
        },
        json: true
      })

      ctx.body = { data: 'Bulk Airtime Sent' }
    }
  }
})
