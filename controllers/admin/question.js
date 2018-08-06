module.exports = (Sequelize, Bluebird, Survey, Question) => ({
  add: {
    schema: [
      'data',
      true,
      [
        ['question', true],
        ['questionType', true],
        ['answerType', true],
        ['surveyID', true, 'integer'],
        ['predefindAnswers', true, 'json']
      ]
    ],
    async method (ctx) {
      const {
        data: { question, questionType, answerType, surveyID, predefindAnswers }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyID } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyID}` }
        ])
      }

      if (!question) {
        return Bluebird.reject([
          { key: 'question ', value: `Question cannot be empty` }
        ])
      }
      const quest = await Question.create({
        question,
        questionType,
        answerType,
        surveyID,
        predefindAnswers
      })
      ctx.body = { data: { questionId: quest.id } }
    }
  },

  delete: {
    schema: ['data', true, [['questionId', true]]],
    async method (ctx) {
      const {
        data: { questionId }
      } = ctx.request.body

      const question = await Question.findOne({ where: { id: questionId } })
      if (!question) {
        return Bluebird.reject([
          { key: 'question', value: `Question not found for ID: ${questionId}` }
        ])
      }

      await question.destroy()

      ctx.body = { data: { questionId } }
    }
  },

  update: {
    schema: [
      'data',
      true,
      [
        ['questionId', true, 'integer'],
        ['question'],
        ['predefindAnswers'],
        ['questionType'],
        ['answerType']
      ]
    ],
    async method (ctx) {
      const {
        data: {
          questionId,
          question,
          predefindAnswers,
          questionType,
          answerType
        }
      } = ctx.request.body

      const quest = await Question.findOne({ where: { id: questionId } })
      if (!quest) {
        return Bluebird.reject([
          { key: 'question', value: `Question not found for ID: ${questionId}` }
        ])
      }

      let updatedObj = {}
      if (question) updatedObj.question = question
      if (predefindAnswers) updatedObj.predefindAnswers = predefindAnswers
      if (questionType) updatedObj.questionType = questionType
      if (answerType) updatedObj.answerType = answerType

      await quest.update(updatedObj)

      ctx.body = { data: { question: quest.id } }
    }
  }
})
