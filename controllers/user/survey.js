module.exports = (config, request) => ({
  getAll: {
    async method (ctx) {
      const {
        data: { clientID, offset, limit }
      } = ctx.request.body
      const {
        data: { surveys, surveysCount }
      } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-client-surveys`,
        body: {
          secret: process.env.apiSecret,
          data: { clientID, offset, limit }
        },
        json: true
      })
      ctx.body = { surveys, surveysCount }
    }
  },

  create: {
    schema: [
      [
        'data',
        true,
        [
          ['name', true],
          ['description', true],
          ['introString', true],
          ['completionString', true],
          ['incentive', true, 'integer'],
          ['currency', true]
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          name,
          description,
          introString,
          completionString,
          incentive,
          currency
        }
      } = ctx.request.body

      const { data, surveyId } = await request.post({
        uri: `${config.constants.URL}/admin/survey-create`,
        body: {
          secret: process.env.apiSecret,
          data: {
            name,
            description,
            introString,
            completionString,
            incentive,
            currency
          }
        },
        json: true
      })

      console.log(data, surveyId)

      ctx.body = { data: 'Survey has been succesfully created' }
    }
  },
  updateDetails: {
    schema: [
      [
        'data',
        true,
        [
          ['surveyId', true, 'integer'],
          ['name', true],
          ['description', true],
          ['introString', true],
          ['completionString', true],
          ['incentive', true, 'integer'],
          ['currency', true]
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          surveyId,
          name,
          description,
          introString,
          completionString,
          incentive,
          currency
        }
      } = ctx.request.body

      const { survey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-update`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId,
            name,
            description,
            introString,
            completionString,
            incentive,
            currency
          }
        },
        json: true
      })

      ctx.body = { survey }
    }
  },
  changeState: {
    async method (ctx) {
      const {
        data: { surveyId, state }
      } = ctx.request.body

      const { survey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-toggle-state`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId,
            state
          }
        },
        json: true
      })
      console.log(survey.state)
      ctx.body = { survey }
    }
  }
})
