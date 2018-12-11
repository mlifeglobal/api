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
  updatePublish: {
    schema: [
      [
        'data',
        true,
        [
          ['surveyId', true, 'integer'],
          ['platforms', 'array'],
          ['optInCodes'],
          ['initCodes']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, platforms, optInCodes, initCodes }
      } = ctx.request.body
      console.log(optInCodes, initCodes)
      if (platforms) {
        await request.post({
          uri: `${config.constants.URL}/admin/survey-publish`,
          body: {
            secret: process.env.apiSecret,
            data: {
              surveyId,
              platforms
            }
          },
          json: true
        })
      }
      if (optInCodes) {
        await request.post({
          uri: `${config.constants.URL}/admin/survey-add-opt-in-codes`,
          body: {
            secret: process.env.apiSecret,
            data: {
              surveyId,
              optInCodes: optInCodes.split(',')
            }
          },
          json: true
        })
      }

      if (initCodes) {
        await request.post({
          uri: `${config.constants.URL}/admin/survey-add-init-codes`,
          body: {
            secret: process.env.apiSecret,
            data: {
              surveyId,
              initCodes: initCodes.split(',')
            }
          },
          json: true
        })
      }
      ctx.body = { data: 'sucessfully updated' }
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
  },

  getQuestions: {
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const { data } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      ctx.body = { questions: data }
    }
  }
})
