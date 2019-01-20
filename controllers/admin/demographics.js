module.exports = Demographic => ({
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
    async method (ctx) {
      ctx.body = { isValid: true }
    }
  },

  validateAge: {
    async method (ctx) {
      ctx.body = { isValid: true }
    }
  },

  validateCountry: {
    async method (ctx) {
      ctx.body = { isValid: true }
    }
  }
})
