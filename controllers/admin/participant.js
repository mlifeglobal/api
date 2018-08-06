module.exports = (
  Sequelize,
  Bluebird,
  Participant,
  Survey,
  ParticipantSurvey,
  Question
) => ({
  create: {
    schema: [['data', true, [['phone'], ['facebookId']]]],
    async method (ctx) {
      const {
        data: { phone, facebookId }
      } = ctx.request.body

      if (!phone && !facebookId) {
        return Bluebird.reject([
          {
            key: 'participant',
            value: `Participant Create requires either unique phone or facebook id.`
          }
        ])
      }

      const participant = await Participant.create({ phone, facebookId })
      ctx.body = { data: { participantId: participant.id } }
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
  },
  delete: {
    schema: [['data', true, [['participantId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { participantId }
      } = ctx.request.body

      const participant = await Participant.findOne({
        where: { id: participantId }
      })
      if (!participant) {
        return Bluebird.reject([
          {
            key: 'participant',
            value: `Participant not found for ID: ${participantId}`
          }
        ])
      }

      await participant.destroy()

      ctx.body = { data: { participantId } }
    }
  },

  getSurvey: {
    schema: [
      [
        'data',
        true,
        [['participantId', true, 'integer'], ['optInCode'], ['platform']]
      ]
    ],
    async method (ctx) {
      const {
        data: { participantId, optInCode, platform }
      } = ctx.request.body

      const participant = await Participant.findOne({
        where: { id: participantId }
      })
      if (!participant) {
        return Bluebird.reject([
          {
            key: 'participant',
            value: `Participant not found for ID: ${participantId}`
          }
        ])
      }

      // Check for surveys in progress
      const participantSurvey = await ParticipantSurvey.findOne({
        where: { participantId, status: 'in_progress' }
      })
      if (participantSurvey) {
        const { status, surveyId, lastQuestionId } = participantSurvey
        ctx.body = { data: { status, surveyId, questionId: lastQuestionId } }
        return
      }

      // No opt in code provided
      if (!optInCode) {
        return Bluebird.reject([
          {
            key: 'participant',
            value: `Participant ${participantId} should provide an opt in code for a live survey.`
          }
        ])
      }

      // Invalid opt in code
      const whereClause = {
        state: 'in_progress',
        optInCodes: { [Sequelize.Op.contains]: [optInCode] }
      }
      if (platform) {
        whereClause.platforms = { [Sequelize.Op.contains]: [platform] }
      }
      const newSurvey = await Survey.findOne({ where: whereClause })
      if (!newSurvey) {
        return Bluebird.reject([
          {
            key: 'participant',
            value: `Participant ${participantId} provided invalid opt in code that does not match with any live survey.`
          }
        ])
      }

      // Return new survey information
      ctx.body = {
        data: {
          status: 'new',
          surveyId: newSurvey.id
        }
      }
    }
  },

  getQuestion: {
    schema: [
      [
        'data',
        true,
        [
          ['participantId', true, 'integer'],
          ['surveyId', true, 'integer'],
          ['lastQuestionId', 'integer']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { participantId, surveyId, lastQuestionId }
      } = ctx.request.body

      const participant = await Participant.findOne({
        where: { id: participantId }
      })
      if (!participant) {
        return Bluebird.reject([
          {
            key: 'participant',
            value: `Participant not found for ID: ${participantId}`
          }
        ])
      }

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          {
            key: 'survey',
            value: `Survey not found for ID: ${surveyId}`
          }
        ])
      }

      let nextQuestionId

      if (lastQuestionId) {
        const lastQuestion = await Question.findOne({
          where: { id: lastQuestionId }
        })
        if (!lastQuestion) {
          return Bluebird.reject([
            {
              key: 'question',
              value: `Question not found for ID: ${lastQuestionId}`
            }
          ])
        }

        // Get next question
        const nextQuestion = await Question.findOne({
          where: {
            survey_id: surveyId,
            order: { [Sequelize.Op.gt]: lastQuestion.order }
          },
          order: [['order', 'ASC']]
        })

        if (!nextQuestion) nextQuestionId = -1
        else nextQuestionId = nextQuestion.id
      } else {
        // Get first question
        const firstQuestion = await Question.findOne({
          where: { survey_id: surveyId },
          order: [['order', 'ASC']]
        })
        if (!firstQuestion) {
          return Bluebird.reject([
            {
              key: 'Survey',
              value: `Survey ${surveyId} has no questions.`
            }
          ])
        }

        nextQuestionId = firstQuestion.id
      }

      ctx.body = { data: { nextQuestionId } }
    }
  }
})
