module.exports = (
  request,
  config,
  Sequelize,
  Bluebird,
  Participant,
  Survey,
  ParticipantSurvey,
  Question,
  ParticipantAnswer,
  PredefinedAnswer
) => ({
  process: {
    schema: [
      [
        'data',
        true,
        [['platform', true], ['identifier', true], ['message', true]]
      ]
    ],
    async method (ctx) {
      const {
        data: { platform, identifier, message }
      } = ctx.request.body

      // Check against supported platforms
      if (!['sms', 'facebook', 'whatsapp'].includes(platform)) {
        return Bluebird.reject([
          {
            key: 'Platform',
            value: `Filler platform ${platform} is not supported. Supported platforms are sms, facebook, and whatsapp.`
          }
        ])
      }

      // Parse info according to filler platform
      let identifierColumn
      let distributionPlatform
      switch (platform) {
        case 'sms':
          identifierColumn = 'phone'
          distributionPlatform = 'sms'
          break
        case 'facebook':
          identifierColumn = 'facebookId'
          distributionPlatform = 'facebook'
          break
        case 'whatsapp':
          identifierColumn = 'whatsappId'
          distributionPlatform = 'whatsapp'
          break
        default:
          break
      }

      // Get or create participant entry
      const participantData = {}
      participantData[identifierColumn] = identifier
      const {
        data: { participantId }
      } = await request.post({
        uri: `${config.constants.URL}/admin/participant-create`,
        body: {
          secret: process.env.apiSecret,
          data: participantData
        },
        json: true
      })

      // Fetch the survey
      const {
        data: {
          status: participantSurveyStatus,
          surveyId,
          reply: participantSurveyReply
        }
      } = await request.post({
        uri: `${config.constants.URL}/admin/participant-get-survey`,
        body: {
          secret: process.env.apiSecret,
          data: {
            participantId,
            optInCode: message,
            platform: distributionPlatform
          }
        },
        json: true
      })

      if (participantSurveyStatus === 'dismatch') {
        // Opt in code did not match
        ctx.body = {
          data: { reply: participantSurveyReply }
        }
        return
      } else if (participantSurveyStatus === 'new') {
        const {
          data: { reply }
        } = await request.post({
          uri: `${config.constants.URL}/admin/participant-intro-survey`,
          body: {
            secret: process.env.apiSecret,
            data: { participantId, surveyId }
          },
          json: true
        })
        ctx.body = {
          data: { reply }
        }
        return
      } else if (participantSurveyStatus === 'intro') {
        // Check message against predefined initiation_codes for survey
        const {
          data: { reply }
        } = await request.post({
          uri: `${config.constants.URL}/admin/participant-validate-init-code`,
          body: {
            secret: process.env.apiSecret,
            data: { participantId, surveyId, initCode: message }
          },
          json: true
        })

        if (reply) {
          ctx.body = {
            data: { reply }
          }
          return
        }
      }

      // Fetch the question
      const {
        data: { questionId }
      } = await request.post({
        uri: `${config.constants.URL}/admin/participant-get-question`,
        body: {
          secret: process.env.apiSecret,
          data: { participantId, surveyId }
        },
        json: true
      })

      // Save message as answer to the question if not intro
      let nextQuestionId = questionId
      if (participantSurveyStatus !== 'intro') {
        const {
          data: { nextQuestionId: nextQuestionIdFromSaveAnswer, reply }
        } = await request.post({
          uri: `${config.constants.URL}/admin/participant-save-answer`,
          body: {
            secret: process.env.apiSecret,
            data: { participantId, surveyId, questionId, answers: [message] }
          },
          json: true
        })
        nextQuestionId = nextQuestionIdFromSaveAnswer

        if (reply) {
          ctx.body = {
            data: { reply }
          }
          return
        }
      }

      // Format question as reply message
      const {
        data: { reply: formattedQuestion }
      } = await request.post({
        uri: `${config.constants.URL}/admin/question-format`,
        body: {
          secret: process.env.apiSecret,
          data: { questionId: nextQuestionId }
        },
        json: true
      })

      ctx.body = { data: { reply: formattedQuestion } }
    },
    onError (error) {
      if (error instanceof Sequelize.UniqueConstraintError) {
      }
    }
  }
})
