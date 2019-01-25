module.exports = (Demographic, request, config) => ({
  importDefault: {
    async method (ctx) {
      const DEFAULT_DEMOGRAPHICS = [
        {
          key: 'phone',
          validation: 'URL_validate-phone',
          validationMsg: 'Please provide valid phone number with country code.'
        },
        {
          key: 'age',
          validation: 'URL_validate-age',
          validationMsg: 'Please provide valid phone number with country code.'
        },
        {
          key: 'country',
          validation: 'URL_validate-country',
          validationMsg: 'Please provide valid phone number with country code.'
        }
      ]

      DEFAULT_DEMOGRAPHICS.forEach(async data => {
        const demographic = await Demographic.findOne({
          where: { key: data.key }
        })

        if (demographic) {
          await demographic.update(data)
        } else {
          await Demographic.create(data)
        }
      })

      ctx.body = {}
    }
  },

  validatePhone: {
    schema: [['data', true, [['value', true]]]],
    async method (ctx) {
      const {
        data: { value: phone }
      } = ctx.request.body

      const { valid } = await request.get({
        uri: `${config.constants.API_LAYER_URL}/validate?access_key=${
          process.env.numVerifyToken
        }&number=${phone}`,
        json: true
      })

      ctx.body = { valid }
    }
  },

  validateAge: {
    async method (ctx) {
      ctx.body = { valid: true }
    }
  },

  validateCountry: {
    async method (ctx) {
      ctx.body = { valid: true }
    }
  }
})
