module.exports = (Bluebird, request, config) => ({
  optIn: {
    schema: [['data', true, [['code', true]]]],
    async method (ctx) {
      const {
        data: { code }
      } = ctx.request.body

      const {
        data: { status, surveyId, reply }
      } = await request.post({
        uri: `${config.constants.URL}/admin/participant-get-survey`,
        body: {
          secret: process.env.apiSecret,
          data: {
            participantId: ctx.authorized.id,
            optInCode: code,
            platform: 'web'
          }
        },
        json: true
      })

      if (!surveyId) {
        return Bluebird.reject([
          { key: 'optInCode', value: reply || 'Opt in code did not match.' }
        ])
      }

      console.log({ status, surveyId })

      ctx.body = {}
    }
  }
})
