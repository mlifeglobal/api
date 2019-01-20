module.exports = (User, config, request) => ({
  getAll: {
    schema: [
      ['data', true, [['offset', true, 'integer'], ['limit', true, 'integer']]]
    ],
    async method (ctx) {
      const {
        data: { offset, limit }
      } = ctx.request.body

      const user = await User.findOne({ where: { id: ctx.authorized.id } })

      const {
        data: { surveys, surveysCount }
      } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-client-surveys`,
        body: {
          secret: process.env.apiSecret,
          data: { clientID: user.clientID, offset, limit }
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

      ctx.body = {
        survey,
        message: 'Survey details have been successfully updated'
      }
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
      ctx.body = {
        survey,
        message: 'Survey state has been succesfully updated'
      }
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
  },
  deleteQuestion: {
    async method (ctx) {
      const {
        data: { questionId, surveyId }
      } = ctx.request.body

      await request.post({
        uri: `${config.constants.URL}/admin/question-delete`,
        body: {
          secret: process.env.apiSecret,
          data: {
            questionId
          }
        },
        json: true
      })
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
  },
  addQuestion: {
    async method (ctx) {
      const {
        data: { question, surveyId, questionType, predefAnswers }
      } = ctx.request.body

      let predefinedAnswers = {}
      let n = 0
      if (predefAnswers && predefAnswers.length) {
        for (var answer of predefAnswers) {
          predefinedAnswers[n] = { value: answer }
          n++
        }
      }

      await request.post({
        uri: `${config.constants.URL}/admin/question-create`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId,
            question,
            questionType,
            predefinedAnswers
          }
        },
        json: true
      })
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
  },

  updateQuestion: {
    async method (ctx) {
      const {
        data: { question, surveyId, questionId, questionType, predefAnswers }
      } = ctx.request.body

      let predefinedAnswers = {}
      let n = 0
      if (predefAnswers && predefAnswers.length) {
        for (var answer of predefAnswers) {
          predefinedAnswers[n] = { value: answer }
          n++
        }
      }
      console.log(predefAnswers)

      await request.post({
        uri: `${config.constants.URL}/admin/question-update`,
        body: {
          secret: process.env.apiSecret,
          data: {
            questionId,
            question,
            questionType,
            predefinedAnswers
          }
        },
        json: true
      })
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
      ctx.body = {
        questions: data,
        message: 'Question has been succesfully updated'
      }
    }
  }
})
