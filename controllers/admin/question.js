module.exports = (Sequelize, Bluebird, Survey, Question) => ({
  create: {
    schema: [
      [
        'data',
        true,
        [
          ['question', true],
          ['questionType', true],
          ['answerType', true],
          ['surveyID', true, 'integer'],
          ['predefinedAnswers', true, 'object']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          question,
          questionType,
          answerType,
          surveyID,
          predefinedAnswers
        }
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
        predefinedAnswers
      })
      ctx.body = { data: { questionId: quest.id } }
    }
  },
  delete: {
    schema: [['data', true, [['questionId', true, 'integer']]]],
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
      [
        'data',
        true,
        [
          ['questionId', true, 'integer'],
          ['question'],
          ['predefinedAnswers', 'object'],
          ['questionType'],
          ['answerType']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          questionId,
          question,
          predefinedAnswers,
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
      if (predefinedAnswers) updatedObj.predefinedAnswers = predefinedAnswers
      if (questionType) updatedObj.questionType = questionType
      if (answerType) updatedObj.answerType = answerType

      await quest.update(updatedObj)

      ctx.body = { data: updatedObj }
    }
  },

  changeOrder: {
    schema: [
      [
        'data',
        true,
        [['questionId1', true, 'integer'], ['questionId2', true, 'integer']]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId1, questionId2 }
      } = ctx.request.body

      const question1 = await Question.findOne({ where: { id: questionId1 } })
      if (!question1) {
        return Bluebird.reject([
          {
            key: 'questionId1',
            value: `Question not found for ID: ${questionId1}`
          }
        ])
      }
      const question2 = await Question.findOne({ where: { id: questionId2 } })
      if (!question2) {
        return Bluebird.reject([
          {
            key: 'questionId2',
            value: `Question not found for ID: ${questionId2}`
          }
        ])
      }

      if (question1.surveyID !== question2.surveyID) {
        return Bluebird.reject([
          {
            key: 'survey mismatch',
            value: 'Questions do not belong to the same survey'
          }
        ])
      }

      let tempOrder = question1.order
      await question1.update({ order: question2.order })
      await question2.update({ order: tempOrder })

      ctx.body = { data: 'success' }
    }
  },

  setBranch: {
    schema: [
      [
        'data',
        true,
        [
          ['questionId', true, 'integer'],
          ['answerKey', true],
          ['skipQuestions', true, 'array']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId, answerKey, skipQuestions }
      } = ctx.request.body

      if (skipQuestions.length === 0) {
        return Bluebird.reject([
          {
            key: 'skipQuestions',
            value: `No skip question ids have been provided`
          }
        ])
      }
      const quest = await Question.findOne({ where: { id: questionId } })
      if (!quest) {
        return Bluebird.reject([
          { key: 'question', value: `Question not found for ID: ${questionId}` }
        ])
      }

      let predefinedAnswers = quest.predefinedAnswers
      if (!(answerKey in predefinedAnswers)) {
        return Bluebird.reject([
          {
            key: 'answerKey',
            value: `AnswerKey ${answerKey} not found for  question ID: ${questionId}`
          }
        ])
      }
      if ('skipQuestions' in predefinedAnswers[answerKey]) {
        const curSkipQuestions = predefinedAnswers[answerKey].skipQuestions
        predefinedAnswers[answerKey].skipQuestions = curSkipQuestions.concat(
          skipQuestions
        )
      } else {
        predefinedAnswers[answerKey].skipQuestions = skipQuestions
      }

      await quest.update({ predefinedAnswers })

      ctx.body = { data: 'successfully updated skipQuestions' }
    }
  }
})
