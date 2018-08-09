module.exports = (
  Sequelize,
  Bluebird,
  Survey,
  Question,
  PredefinedAnswers
) => ({
  create: {
    schema: [
      [
        'data',
        true,
        [
          ['question', true],
          ['questionType'],
          ['answerType'],
          ['surveyID', true, 'integer'],
          ['predefinedAnswers', 'object']
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
      // Create entry for predefinedAnswers if provided
      if (predefinedAnswers && Object.keys(predefinedAnswers).length) {
        for (var answer in predefinedAnswers) {
          console.log(answer)
          let predAnsObj = {}
          predAnsObj.questionID = quest.id
          predAnsObj.answerKey = answer
          predAnsObj.answerValue = predefinedAnswers[answer]['value']

          if ('skipQuestions' in predefinedAnswers[answer]) {
            predAnsObj.skipQuestions =
              predefinedAnswers[answer]['skipQuestions']
          }

          const predAns = await PredefinedAnswers.create(predAnsObj)
        }
      }
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
      if (questionType) updatedObj.questionType = questionType
      if (answerType) updatedObj.answerType = answerType

      // Design Decision to make: whether endpoint to update PredefinedAnswers
      // or destroy existing ones and create new entries?
      if (predefinedAnswers && Object.keys(predefinedAnswers).length) {
        for (var answer in predefinedAnswers) {
          await PredefinedAnswers.destroy({ where: { questionID: questionId } })

          let predAnsObj = {}
          predAnsObj.questionID = quest.id
          predAnsObj.answerKey = answer
          predAnsObj.answerValue = predefinedAnswers[answer]['value']

          if ('skipQuestions' in predefinedAnswers[answer]) {
            predAnsObj.skipQuestions =
              predefinedAnswers[answer]['skipQuestions']
          }

          const predAns = await PredefinedAnswers.create(predAnsObj)
          console.log(predAns.id)
        }
      }

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
        [['predAnsId', true, 'integer'], ['skipQuestions', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { predAnsId, skipQuestions }
      } = ctx.request.body

      if (skipQuestions.length === 0) {
        return Bluebird.reject([
          {
            key: 'skipQuestions',
            value: `No skip question ids have been provided`
          }
        ])
      }
      const predAnsObj = await PredefinedAnswers.findOne({
        where: { id: predAnsId }
      })
      if (!predAnsObj) {
        return Bluebird.reject([
          {
            key: 'predefined_answer',
            value: `Predefined answer not found for ID: ${predAnsId}`
          }
        ])
      }
      // No concating needed
      // let curSkipQuestions = predAnsObj.skipQuestions.concat(skipQuestions)
      await predAnsObj.update({ skipQuestions })

      ctx.body = { data: 'successfully updated skipQuestions' }
    }
  }
})
