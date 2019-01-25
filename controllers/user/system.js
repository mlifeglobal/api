module.exports = (
  Bluebird,
  Survey,
  Participant,
  ParticipantAnswer,
  Message,
  config,
  request
) => ({
  fetch: {
    async method (ctx) {
      const surveys = await Survey.count()
      const participants = await Participant.count()
      const messages = await Message.count()
      const dataPoints = await ParticipantAnswer.count()

      ctx.body = {
        data: {
          surveys: surveys,
          participants: participants,
          dataPoints: dataPoints,
          messages: messages
        }
      }
    }
  },

  sendBulk: {
    schema: [
      ['data', true, [['phones', true], ['message', true], ['incentive', true]]]
    ],
    async method (ctx) {
      const {
        data: { phones, message, incentive }
      } = ctx.request.body

      if (!message && !incentive) {
        return Bluebird.reject([
          {
            key: 'insufficient_data',
            value: "Both message and incentive can't be blank."
          }
        ])
      }

      const invalidPhones = []
      const phonesArr = phones.replace(/\s/g, '').split(',')
      for (const value of phonesArr) {
        const { valid } = await request.post({
          uri: `${config.constants.URL}/admin/demographics-validate-phone`,
          body: {
            secret: process.env.apiSecret,
            data: {
              value
            }
          },
          json: true
        })
        if (!valid) {
          invalidPhones.push(value)
        }
      }

      if (invalidPhones.length > 0) {
        return Bluebird.reject([
          {
            key: 'validation_error',
            value: `${invalidPhones.join(
              ','
            )} are not valid phone numbers. Please include country code in all the numbers.`
          }
        ])
      }

      if (incentive) {
        const [currency, amount] = incentive.split(' ')
        if (!currency || !amount) {
          return Bluebird.reject([
            {
              key: 'invalid_incentive',
              value:
                'Invalid incentive format. It should include both currency code and amount separated by white space like "KES 50"'
            }
          ])
        }

        const supportedCurrencies = {
          KES: {
            min: 5,
            max: 10000
          },
          UGX: {
            min: 50,
            max: 200000
          },
          TZS: {
            min: 500,
            max: 200000
          },
          NGN: {
            min: 50,
            max: 5000
          }
        }

        if (!Object.keys(supportedCurrencies).includes(currency)) {
          return Bluebird.reject([
            {
              key: 'invalid_incentive_currency',
              value:
                'Invalid incentive currency code. We currently support only ["KES", "UGX", "TZS", "NGN"]'
            }
          ])
        }

        if (isNaN(amount)) {
          return Bluebird.reject([
            {
              key: 'invalid_incentive_amount',
              value: `Incentive amount provided (${amount}) is not number.`
            }
          ])
        }

        const { min, max } = supportedCurrencies[currency]
        if (amount < min || amount > max) {
          return Bluebird.reject([
            {
              key: 'invalid_incentive_amount',
              value: `Incentive amount for ${currency} currency should be in range [${min}, ${max}]`
            }
          ])
        }

        request.post({
          uri: `${config.constants.URL}/africas-talking-bulk-airtime`,
          body: {
            data: {
              numbers: phonesArr,
              incentive: amount,
              currency
            }
          },
          json: true
        })
      }

      if (message) {
        request.post({
          uri: `${config.constants.URL}/africas-talking-bulk-sms`,
          body: {
            data: {
              numbers: phonesArr,
              message
            }
          },
          json: true
        })
      }

      ctx.body = {}
    }
  }
})
