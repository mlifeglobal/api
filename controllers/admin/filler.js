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
  receive: {
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

      console.log(message)

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
          distributionPlatform = 'facebook'
          break
        default:
          break
      }

      console.log(distributionPlatform)

      // Get or create participant entry
      const participantObj = {}
      participantObj[identifierColumn] = identifier
      let participant = await Participant.findOne({ where: participantObj })
      if (!participant) {
        participant = await Participant.create(participantObj)
      }

      // Fetch participant active survey
      const {
        data: { surveyId }
      } = await request.post({
        uri: `${config.constants.URL}/admin/participant-active-survey`,
        body: {
          secret: process.env.apiSecret,
          data: { participantId: participant.id }
        },
        json: true
      })

      if (surveyId) {
        // Get the question from survey
        await request.post({
          uri: `${config.constants.URL}/admin/participant-get-question`,
          body: {
            secret: process.env.apiSecret,
            data: { participantId: participant.id, surveyId }
          },
          json: true
        })
      } else {
        // Message should be opt in code for new survey
      }

      ctx.body = { data: {} }
    },
    onError (error) {
      if (error instanceof Sequelize.UniqueConstraintError) {
        const fields = Object.keys(error.fields)
        const field = fields.includes('facebookId')
          ? 'facebookId'
          : fields.includes('phone')
            ? 'phone'
            : 'email'
        return [{ key: field, value: `This ${field} is already taken.` }]
      }
    }
  }
})
