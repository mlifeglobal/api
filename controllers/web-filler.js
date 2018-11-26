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

      let data = {}

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

        const verifyRes = await request.get({
          uri: `${config.constants.API_LAYER_URL}/validate?access_key=${
            process.env.numVerifyToken
          }&number=${phone}`,
          json: true
        })
        console.log(verifyRes)
        const { valid, international_format: internationalFormat } = verifyRes
        console.log({ valid, internationalFormat })

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

        data = participant.getData()

        const inProgressSurvey = await ParticipantSurvey.findOne({
          where: { participantId: participant.id, status: 'in_progress' }
        })
        if (inProgressSurvey) {
          data.surveyID = inProgressSurvey.surveyId
          data.lastQuestionID = inProgressSurvey.lastAnsweredQuestionId
        }
      }

      ctx.body = { data }
    }
  }
})
