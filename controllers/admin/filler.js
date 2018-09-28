module.exports = (request, config, Sequelize, Bluebird, Message, Constant) => ({
  process: {
    schema: [
      [
        'data',
        true,
        [
          ['platform', true],
          ['identifier', true],
          ['message', true],
          ['messageIdentifier', 'string']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { platform, identifier, message, messageIdentifier }
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
        case 'whatsapp':
        case 'sms':
          identifierColumn = 'phone'
          distributionPlatform = 'sms'
          break
        case 'facebook':
          identifierColumn = 'facebookId'
          distributionPlatform = 'facebook'
          break
        default:
          break
      }
      // Get or create participant entry
      const participantData = {}
      participantData[identifierColumn] = identifier
      participantData.fromWhatsapp = platform === 'whatsapp'

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

      // Create Message entry
      await Message.create({
        message,
        platform,
        participantID: participantId,
        messageIdentifier
      })

      if (message.toLowerCase() === 'reset') {
        const resetPerm = await Constant.findOne({ where: { name: 'reset' } })
        let tmpIdentifiers = resetPerm.text.split(',')
        if (tmpIdentifiers.indexOf(identifier) > -1) {
          await request.post({
            uri: `${config.constants.URL}/admin/participant-delete`,
            body: {
              secret: process.env.apiSecret,
              data: { participantId }
            },
            json: true
          })
          ctx.body = {
            data: {
              reply:
                'You have been reset. Please reply back with valid opt in code to start filling.'
            }
          }
          return
        }
      }

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
        await Message.create({
          message: participantSurveyReply,
          platform,
          participantID: participantId,
          direction: 'outgoing'
        })

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
        await Message.create({
          message: reply,
          platform,
          participantID: participantId,
          direction: 'outgoing'
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
          await Message.create({
            message: reply,
            platform,
            participantID: participantId,
            direction: 'outgoing'
          })
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
          data: { participantId, surveyId, platform: distributionPlatform }
        },
        json: true
      })

      // Save message as answer to the question if not intro
      let nextQuestionId = questionId
      let replaceFormatQuestionText = false
      if (participantSurveyStatus !== 'intro') {
        const {
          data: {
            nextQuestionId: nextQuestionIdFromSaveAnswer,
            reply,
            status: saveAnswerStatus
          }
        } = await request.post({
          uri: `${config.constants.URL}/admin/participant-save-answer`,
          body: {
            secret: process.env.apiSecret,
            data: {
              participantId,
              surveyId,
              questionId,
              platform: distributionPlatform,
              answers: [message]
            }
          },
          json: true
        })

        if (saveAnswerStatus === 'dismatch') {
          replaceFormatQuestionText = true
        } else {
          nextQuestionId = nextQuestionIdFromSaveAnswer
        }

        if (reply) {
          await Message.create({
            message: reply,
            platform,
            participantID: participantId,
            direction: 'outgoing'
          })
          ctx.body = {
            data: { reply }
          }
          return
        }
      }

      // Format question as reply message
      const {
        data: { reply: formattedQuestion, questionData }
      } = await request.post({
        uri: `${config.constants.URL}/admin/question-format`,
        body: {
          secret: process.env.apiSecret,
          data: {
            questionId: nextQuestionId,
            replaceQuestionText: replaceFormatQuestionText
          }
        },
        json: true
      })

      await Message.create({
        message: formattedQuestion,
        platform,
        participantID: participantId,
        direction: 'outgoing'
      })
      ctx.body = { data: { reply: formattedQuestion, questionData } }
    },
    onError (error) {
      if (error instanceof Sequelize.UniqueConstraintError) {
      }
    }
  }
})
