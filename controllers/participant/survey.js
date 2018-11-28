module.exports = (
  Bluebird,
  Survey,
  Question,
  ParticipantSurvey,
  request,
  config
) => ({
  optIn: {
    schema: [['data', true, [['code', true]]]],
    async method (ctx) {
      const {
        data: { code }
      } = ctx.request.body

      const participantId = ctx.authorized.id

      const {
        data: { status, surveyId, reply }
      } = await request.post({
        uri: `${config.constants.URL}/admin/participant-get-survey`,
        body: {
          secret: process.env.apiSecret,
          data: {
            participantId,
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

      const survey = { status, surveyId }

      if (status === 'new') {
        const surveyInstance = await Survey.findOne({ where: { id: surveyId } })
        survey.introString = surveyInstance.introString
      } else {
        const {
          data: { questionId }
        } = await request.post({
          uri: `${config.constants.URL}/admin/participant-get-question`,
          body: {
            secret: process.env.apiSecret,
            data: {
              participantId,
              surveyId
            }
          },
          json: true
        })

        // Get the question data
        const {
          data: { questionData }
        } = await request.post({
          uri: `${config.constants.URL}/admin/question-format`,
          body: {
            secret: process.env.apiSecret,
            data: {
              questionId
            }
          },
          json: true
        })

        survey.question = questionData
      }

      console.log(survey)
      ctx.body = { data: { survey } }
    }
  },

  start: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const participantId = ctx.authorized.id

      await ParticipantSurvey.create({
        participantId,
        surveyId,
        status: 'initiated'
      })

      const {
        data: { status, questionId }
      } = await request.post({
        uri: `${config.constants.URL}/admin/participant-get-question`,
        body: {
          secret: process.env.apiSecret,
          data: {
            participantId,
            surveyId
          }
        },
        json: true
      })

      // Get the question data
      const {
        data: { questionData }
      } = await request.post({
        uri: `${config.constants.URL}/admin/question-format`,
        body: {
          secret: process.env.apiSecret,
          data: {
            questionId
          }
        },
        json: true
      })

      ctx.body = {
        data: { survey: { surveyId, status, question: questionData } }
      }
    }
  }
})
