module.exports = (
  Sequelize,
  Bluebird,
  Survey,
  Question,
  PredefinedAnswer,
  ParticipantAnswer,
  Demographic,
  lodash
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
          ['surveyId', true, 'integer'],
          ['predefinedAnswers', 'object'],
          ['attachmentKey'],
          ['hasAttachment', 'boolean']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          question,
          questionType,
          answerType,
          surveyId,
          predefinedAnswers,
          attachmentKey,
          hasAttachment
        }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
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
        surveyId,
        attachmentKey,
        hasAttachment,
        platforms: hasAttachment ? ['facebook'] : []
      })

      // Create entry for predefinedAnswers if provided
      if (predefinedAnswers && Object.keys(predefinedAnswers).length) {
        for (const answer in predefinedAnswers) {
          let answerCreateObj = {}
          answerCreateObj.questionId = quest.id
          answerCreateObj.answerKey = answer
          answerCreateObj.answerValue = predefinedAnswers[answer].value

          if ('skipQuestions' in predefinedAnswers[answer]) {
            answerCreateObj.skipQuestions =
              predefinedAnswers[answer].skipQuestions
          }

          await PredefinedAnswer.create(answerCreateObj)
        }
      }
      ctx.body = {
        data: `Question with id ${
          quest.id
        } has been added to survey  ${surveyId}`,
        questionId: quest.id
      }
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

      await Question.destroy({ where: { id: questionId } })

      ctx.body = { data: { questionId } }
    }
  },
  publish: {
    schema: [
      [
        'data',
        true,
        [['questionId', true, 'integer'], ['platforms', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId, platforms }
      } = ctx.request.body

      const question = await Question.findOne({ where: { id: questionId } })
      if (!question) {
        return Bluebird.reject([
          { key: 'question', value: `Question not found for ID: ${questionId}` }
        ])
      }

      await question.update({
        platforms: lodash.union(question.platforms, platforms)
      })

      ctx.body = {
        data: `Qurvey has succesfully published for id: ${question.id}`
      }
    }
  },
  unpublish: {
    schema: [
      [
        'data',
        true,
        [['questionId', true, 'integer'], ['platforms', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId, platforms }
      } = ctx.request.body

      const question = await Question.findOne({ where: { id: questionId } })
      if (!question) {
        return Bluebird.reject([
          { key: 'question', value: `Question not found for ID: ${questionId}` }
        ])
      }

      const updatedPlatforms = lodash.remove(
        question.platforms,
        platform => !platforms.includes(platform)
      )
      await question.update({
        platforms: updatedPlatforms
      })

      ctx.body = {
        data: `Question has succesfully unpublished from ${platforms} for id: ${
          question.id
        }`
      }
    }
  },
  deleteAnswer: {
    schema: [
      [
        'data',
        true,
        [
          ['questionId', true, 'integer'],
          ['answerId', 'integer'],
          ['answerKey', 'integer']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId, answerId, answerKey }
      } = ctx.request.body

      if (!answerId && !answerKey) {
        return Bluebird.reject([
          {
            key: 'PredefinedAnswer',
            value:
              'Predefined answer id or answer key should be provided to delete the answer.'
          }
        ])
      }

      const question = await Question.findOne({ where: { id: questionId } })
      if (!question) {
        return Bluebird.reject([
          {
            key: 'Question',
            value: `Question not found for id: ${questionId}`
          }
        ])
      }

      let answerFindObj = {}
      if (answerId) answerFindObj.id = answerId
      if (answerKey) answerFindObj.answerKey = answerKey

      const answer = await PredefinedAnswer.findOne(answerFindObj)
      if (!answer) {
        return Bluebird.reject([
          {
            key: 'PredefinedAnswer',
            value: 'Predefined Answer not found with provided information'
          }
        ])
      }

      let deletedAnswerid = answer.id
      await PredefinedAnswer.destroy(answerFindObj)

      ctx.body = { data: { deletedAnswerid } }
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

      let questionUpdateObj = {}
      if (question) questionUpdateObj.question = question
      if (questionType) questionUpdateObj.questionType = questionType
      if (answerType) questionUpdateObj.answerType = answerType

      if (predefinedAnswers && Object.keys(predefinedAnswers).length) {
        for (const answerKey in predefinedAnswers) {
          const curPredefinedAnswer = await PredefinedAnswer.findOne({
            where: { questionId, answerKey }
          })
          if (curPredefinedAnswer) {
            let answerUpdateObj = {}
            answerUpdateObj.answerValue = predefinedAnswers[answerKey].value

            if ('skipQuestions' in predefinedAnswers[answerKey]) {
              answerUpdateObj.skipQuestions =
                predefinedAnswers[answerKey].skipQuestions
            }

            await curPredefinedAnswer.update(answerUpdateObj)
          } else {
            let answerCreateObj = {}
            answerCreateObj.questionId = quest.id
            answerCreateObj.answerKey = answerKey
            answerCreateObj.answerValue = predefinedAnswers[answerKey].value

            if ('skipQuestions' in predefinedAnswers[answerKey]) {
              answerCreateObj.skipQuestions =
                predefinedAnswers[answerKey].skipQuestions
            }

            await PredefinedAnswer.create(answerCreateObj)
          }
        }
      }

      await quest.update(questionUpdateObj)

      ctx.body = {
        data: `Question has been successfully updated for ID: ${questionId}`
      }
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

      if (question1.surveyId !== question2.surveyId) {
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

      ctx.body = { data: { success: true } }
    }
  },

  setBranch: {
    schema: [
      [
        'data',
        true,
        [
          ['predefinedAnswerId', true, 'integer'],
          ['skipQuestions', true, 'array']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { predefinedAnswerId, skipQuestions }
      } = ctx.request.body

      if (skipQuestions.length === 0) {
        return Bluebird.reject([
          {
            key: 'skipQuestions',
            value: `No skip question ids have been provided`
          }
        ])
      }
      const predefinedAnswer = await PredefinedAnswer.findOne({
        where: { id: predefinedAnswerId }
      })
      if (!predefinedAnswer) {
        return Bluebird.reject([
          {
            key: 'predefined_answer',
            value: `Predefined answer not found for ID: ${predefinedAnswerId}`
          }
        ])
      }

      await predefinedAnswer.update({ skipQuestions })

      ctx.body = { data: { predefinedAnswerId } }
    }
  },
  setBranchSlack: {
    schema: [
      [
        'data',
        true,
        [
          ['questionId', true, 'integer'],
          ['option', true],
          ['skipQuestions', true, 'array']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId, skipQuestions, option }
      } = ctx.request.body

      if (skipQuestions.length === 0) {
        return Bluebird.reject([
          {
            key: 'skipQuestions',
            value: `No skip question ids have been provided`
          }
        ])
      }
      const predAnswers = await PredefinedAnswer.findAll({
        where: { questionId: questionId },
        raw: true
      })
      if (!predAnswers) {
        return Bluebird.reject([
          {
            key: 'predefined_answer',
            value: `Predefined answer not found for question ID: ${questionId}`
          }
        ])
      }
      let found = false
      for (var ans of predAnswers) {
        if (ans['answerKey'] === option) {
          found = true
          const predefinedAnswer = await PredefinedAnswer.findOne({
            where: { id: ans['id'] }
          })

          await predefinedAnswer.update({ skipQuestions })
          break
        }
      }
      ctx.body = found
        ? { data: 'Branch succesfully set' }
        : { data: 'No option found' }
    }
  },

  format: {
    schema: [
      [
        'data',
        true,
        [['questionId', true, 'integer'], ['replaceQuestionText', 'boolean']]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId, replaceQuestionText }
      } = ctx.request.body

      const question = await Question.findOne({ where: { id: questionId } })
      if (!question) {
        return Bluebird.reject([
          { key: 'question', value: `Question not found for ID: ${questionId}` }
        ])
      }

      const questionData = {
        questionId: question.id,
        question: question.question,
        questionType: question.questionType,
        answerType: question.answerType,
        answers: {}
      }

      if (question.attachmentKey) {
        questionData.attachmentKey = question.attachmentKey
      }

      let reply = replaceQuestionText
        ? 'Please answer with one of the answers below:'
        : question.question

      if (question.questionType === 'mcq') {
        reply +=
          question.answerType === 'multiple'
            ? '\n[In order to choose multiple answers, reply with comma separated answer keys]'
            : '\n[Please, only reply with single answer key]'

        const predefinedAnswers = await PredefinedAnswer.findAll({
          where: { questionId },
          order: ['displayOrder']
        })
        predefinedAnswers.forEach(({ answerKey, answerValue }) => {
          reply += `\n${answerKey}: ${answerValue}`
          questionData.answers[answerKey] = answerValue
        })
      }

      ctx.body = {
        data: { reply, questionData }
      }
    }
  },
  getPredefAnswers: {
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

      let answers = {}
      if (question.questionType === 'mcq') {
        const predefinedAnswers = await PredefinedAnswer.findAll({
          where: { questionId },
          order: ['displayOrder']
        })
        predefinedAnswers.forEach(
          ({ answerKey, answerValue, skipQuestions, id }) => {
            answers[answerKey] = { value: answerValue, skipQuestions, id }
          }
        )
      }
      console.log('answeers', answers)
      ctx.body = {
        data: { answers }
      }
    }
  },

  createDemographics: {
    schema: [
      ['data', true, [['key', true], ['validation'], ['validationMsg']]]
    ],

    async method (ctx) {
      const {
        data: { key, validation, validationMsg }
      } = ctx.request.body

      if (!key) {
        return Bluebird.reject([
          { key: 'demographic_key', value: `Key cannot be null` }
        ])
      }

      await Demographic.create({
        key,
        validation,
        validationMsg
      })

      ctx.body = {
        data: `The demographic for ${key} has been successfully created`
      }
    },
    onError (error) {
      if (error instanceof Sequelize.UniqueConstraintError) {
        const field = Object.keys(error.fields)

        return [{ key: field, value: `This key is already taken.` }]
      }
    }
  },

  attachDemographics: {
    schema: [
      [
        'data',
        true,
        [['questionId', true, 'integer'], ['demographicsKey', true]]
      ]
    ],
    async method (ctx) {
      const {
        data: { questionId, demographicsKey }
      } = ctx.request.body

      const question = await Question.findOne({ where: { id: questionId } })

      if (!question) {
        ctx.body = { data: `Question not found for ID: ${questionId}` }
        return
      }

      const demographic = await Demographic.findOne({
        where: { key: demographicsKey }
      })
      if (!demographic) {
        ctx.body = { data: `Demographic not found for key: ${demographicsKey}` }
        return
      }

      await question.update({ demographicsKey: demographicsKey })

      // Update existing participant answers too
      await ParticipantAnswer.update(
        { demographics: demographicsKey },
        { where: { questionId } }
      )

      ctx.body = {
        data: `Demographic ${demographicsKey} has been attached to question: ${questionId}`
      }
    }
  }
})
