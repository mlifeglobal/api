module.exports = (
  Bluebird,
  Participant,
  ParticipantSurvey,
  config,
  request
) => ({
  authenticate: {
    schema: [['data', true, [['phone', true]]]],
    async method (ctx) {
      const {
        data: { phone }
      } = ctx.request.body

      let data = { participant: {}, survey: {} }

      let participant = await Participant.findOne({ where: { phone } })
      if (!participant) {
        if (phone.charAt(0) !== '+') {
          return Bluebird.reject([
            {
              key: 'phone',
              value:
                'Please include the country code with the + sign. (e.g.: +254123987654)'
            }
          ])
        }

        const {
          valid,
          international_format: internationalFormat
        } = await request.get({
          uri: `${config.constants.API_LAYER_URL}/validate?access_key=${
            process.env.numVerifyToken
          }&number=${phone}`,
          json: true
        })

        if (!valid) {
          return Bluebird.reject([
            { key: 'phone', value: 'Your phone is not valid.' }
          ])
        } else {
          participant = await Participant.create({ phone: internationalFormat })
        }
      }

      if (participant) {
        participant.webLinked = true
        await participant.save()

        data.participant = participant.getData()

        const inProgressSurvey = await ParticipantSurvey.findOne({
          where: { participantId: participant.id, status: 'in_progress' }
        })
        if (inProgressSurvey) {
          data.survey = {
            surveyID: inProgressSurvey.surveyId,
            lastQuestionID: inProgressSurvey.lastAnsweredQuestionId
          }
        }
      }

      ctx.body = { data }
    }
  }
})
