module.exports = (
  Sequelize,
  Bluebird,
  Participant,
  Survey,
  ParticipantSurvey,
  Question,
  ParticipantAnswer,
  PredefinedAnswer,
  lodash,
  request,
  config,
  csvWriter,
  Demographic
) => ({
  create: {
    schema: [
      [
        'data',
        true,
        [['phone'], ['facebookId'], ['fromWhatsapp', 'boolean'], ['fbPageId']]
      ]
    ],
    async method (ctx) {
      const {
        data: { phone, facebookId, fromWhatsapp, fbPageId }
      } = ctx.request.body

      if (!phone && !facebookId) {
        return Bluebird.reject([
          {
            key: 'participant',
            value: `Participant Create requires either unique phone or facebook id.`
          }
        ])
      }

      let participant = null
      const participantFindObj = {}
      // Create/retrieve participant using phone number
      if (phone) {
        participantFindObj.phone = phone

        participant = await Participant.findOne({ where: participantFindObj })
        if (!participant) {
          participant = await Participant.create({
            phone,
            facebookId,
            hasWhatsapp: fromWhatsapp && true
          })
        } else if (fromWhatsapp) {
          participant.update({ hasWhatsapp: true })
        }
      }
      // Check for multiple page ids
      if (facebookId) {
        participant = await Participant.findOne({
          where: { facebookId: { [Sequelize.Op.like]: `%${facebookId}%` } }
        })
        if (!participant) {
          const { fbIds } = await request.post({
            uri: `${config.constants.URL}/facebook-get-page-ids`,
            body: {
              data: {
                fbPageId,
                facebookId
              }
            },
            json: true
          })

          participant = await Participant.create({
            phone,
            facebookId: fbIds,
            hasWhatsapp: fromWhatsapp && true
          })
        } else if (fromWhatsapp) {
          participant.update({ hasWhatsapp: true })
        }
      }

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

      await Participant.destroy({
        where: { id: participantId }
      })

      ctx.body = { data: { participantId } }
    }
  },

  introSurvey: {
    schema: [
      [
        'data',
        true,
        [['participantId', true, 'integer'], ['surveyId', true, 'integer']]
      ]
    ],
    async method (ctx) {
      const {
        data: { participantId, surveyId }
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

      await ParticipantSurvey.create({
        participantId,
        surveyId
      })

      ctx.body = { data: { reply: survey.introString } }
    }
  },

  resetSurvey: {
    schema: [
      [
        'data',
        true,
        [['participantId', true, 'integer'], ['surveyId', true, 'integer']]
      ]
    ],
    async method (ctx) {
      const {
        data: { participantId, surveyId }
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

      await ParticipantAnswer.destroy({ where: { participantId, surveyId } })
      await ParticipantSurvey.destroy({ where: { participantId, surveyId } })

      ctx.body = { data: { participantId, surveyId } }
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

      // Check for survey not completed
      const participantSurvey = await ParticipantSurvey.findOne({
        where: { participantId, status: { [Sequelize.Op.ne]: 'completed' } }
      })
      if (participantSurvey) {
        const { status, surveyId } = participantSurvey
        ctx.body = { data: { status, surveyId } }
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

      // Validate opt in code
      const whereClause = {
        state: 'in_progress',
        optInCodes: { [Sequelize.Op.contains]: [optInCode.toLowerCase()] }
      }
      if (platform) {
        whereClause.platforms = { [Sequelize.Op.contains]: [platform] }
      }

      let dismatchReply
      const newSurvey = await Survey.findOne({ where: whereClause })
      if (!newSurvey) {
        dismatchReply = 'No survey found matching the provided opt in code.'
      } else {
        const participantSurvey = await ParticipantSurvey.findOne({
          where: { participantId, surveyId: newSurvey.id, status: 'completed' }
        })
        if (participantSurvey) {
          dismatchReply = 'You have already filled this survey.'
        }
      }
      if (dismatchReply) {
        // Invalid opt in code
        ctx.body = { data: { status: 'dismatch', reply: dismatchReply } }
        return
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

  validateInitCode: {
    schema: [
      [
        'data',
        true,
        [
          ['participantId', true, 'integer'],
          ['surveyId', true, 'integer'],
          ['initCode', true]
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { participantId, surveyId, initCode }
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

      const data = {}
      if (!survey.initCodes.includes(initCode)) {
        data.reply = 'Invalid initiation code provided for the survey'
      } else {
        const participantSurvey = await ParticipantSurvey.findOne({
          where: { participantId, surveyId }
        })
        if (!participantSurvey) {
          return Bluebird.reject({
            key: 'ParticipantSurvey',
            value: `ParticipantSurvey not found for participantId: ${participantId}, surveyId: ${surveyId}`
          })
        }

        await participantSurvey.update({ status: 'initiated' })
      }

      ctx.body = { data }
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
          ['platform']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { participantId, surveyId, platform }
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
      let lastQuestionId
      let alreadySkipped = []

      // Check ParticipantSurvey record
      const participantSurvey = await ParticipantSurvey.findOne({
        where: { participantId, surveyId }
      })
      if (participantSurvey) {
        lastQuestionId = participantSurvey.lastAnsweredQuestionId
        alreadySkipped = participantSurvey.skippedQuestions
      }

      if (lastQuestionId) {
        const lastQuestion = await Question.findOne({
          where: {
            id: lastQuestionId,
            [Sequelize.Op.or]: [
              { platforms: [] },
              { platforms: { [Sequelize.Op.contains]: [platform] } }
            ]
          }
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
            id: { [Sequelize.Op.notIn]: alreadySkipped },
            survey_id: surveyId,
            [Sequelize.Op.or]: [
              { platforms: [] },
              { platforms: { [Sequelize.Op.contains]: [platform] } }
            ],
            order: { [Sequelize.Op.gt]: lastQuestion.order }
          },
          order: [['order', 'ASC']]
        })

        if (!nextQuestion) nextQuestionId = -1
        else nextQuestionId = nextQuestion.id
      } else {
        // Get first question
        const firstQuestion = await Question.findOne({
          where: {
            survey_id: surveyId,
            [Sequelize.Op.or]: [
              { platforms: [] },
              { platforms: { [Sequelize.Op.contains]: [platform] } }
            ]
          },
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

      ctx.body = {
        data: {
          status: nextQuestionId > 0 ? 'in_progress' : 'completed',
          questionId: nextQuestionId
        }
      }
    }
  },

  saveAnswer: {
    schema: [
      [
        'data',
        true,
        [
          ['participantId', true, 'integer'],
          ['surveyId', true, 'integer'],
          ['questionId', true, 'integer'],
          ['answers', true, 'array'],
          ['platform']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          participantId,
          surveyId,
          questionId,
          answers: rawAnswers,
          platform
        }
      } = ctx.request.body

      const participant = await Participant.findOne({
        where: { id: participantId }
      })
      if (!participant) {
        return Bluebird.reject([
          {
            key: 'Participant',
            value: `Participant not found for ID: ${participantId}`
          }
        ])
      }

      const survey = await Survey.findOne({
        where: { id: surveyId, state: 'in_progress' }
      })
      if (!survey) {
        return Bluebird.reject([
          {
            key: 'Survey',
            value: `Active survey not found for ID: ${surveyId}`
          }
        ])
      }

      const question = await Question.findOne({
        where: { id: questionId }
      })
      if (!question) {
        return Bluebird.reject([
          {
            key: 'Question',
            value: `Question not found for ID: ${questionId}`
          }
        ])
      }

      const participantAnswer = await ParticipantAnswer.findOne({
        where: { participantId, surveyId, questionId }
      })
      if (participantAnswer) {
        return Bluebird.reject([
          {
            key: 'Participant',
            value: `Participant has already answered question ${questionId}`
          }
        ])
      }

      // Parse multiple answers
      let answers = rawAnswers
      if (
        question.questionType === 'mcq' &&
        question.answerType === 'multiple'
      ) {
        answers = rawAnswers[0].replace(/\s/g, '').split(',')
      }

      // Check if provided question id is not in the list of skipped questions
      let alreadySkipped = []
      const participantSurvey = await ParticipantSurvey.findOne({
        where: { participantId, surveyId }
      })
      if (participantSurvey) {
        alreadySkipped = participantSurvey.skippedQuestions
        if (alreadySkipped.includes(questionId)) {
          return Bluebird.reject([
            {
              key: 'Question',
              value: `Question ID: ${questionId} is in the list of skipped questions.`
            }
          ])
        }
      }

      let answersToStore = []
      let questionsToSkip = []
      let mcqAnswerNotMatching
      if (question.questionType === 'open') {
        answersToStore.push(answers[0])
      } else if (question.questionType === 'mcq') {
        if (question.answerType === 'single') {
          if (answers.length > 1) {
            return Bluebird.reject([
              {
                key: 'Question',
                value: `Question ${
                  question.id
                } does not accept multiple answers.`
              }
            ])
          }
        }

        // Check provided answers against predefined ones
        for (const answer of answers) {
          const predefinedAnswer = await PredefinedAnswer.findOne({
            where: {
              questionId,
              answerKey: answer
            }
          })
          if (predefinedAnswer) {
            answersToStore.push(answer)
            questionsToSkip = lodash.union(
              questionsToSkip,
              predefinedAnswer.skipQuestions
            )
          } else {
            mcqAnswerNotMatching = answer || 'blank'
            break
          }
        }
      }

      if (mcqAnswerNotMatching) {
        ctx.body = {
          data: {
            status: 'dismatch'
          }
        }
        return
      }
      if (question.demographicsKey) {
        const demographic = await Demographic.findOne({
          where: { key: question.demographicsKey }
        })
        if (demographic.validation) {
          var re = new RegExp(demographic.validation)
          if (!re.test(answersToStore)) {
            ctx.body = { data: { reply: demographic.validationMsg } }
            return
          }
        }

        // save phone number for facebook users
        if (demographic.key === 'phone' && platform === 'facebook') {
          await Participant.update(
            { phone: answersToStore[0] },
            { where: { id: participantId } }
          )
        }
      }
      // Create ParticipantAnswer record
      await ParticipantAnswer.create({
        participantId,
        surveyId,
        questionId,
        answers: answersToStore,
        demographics: question.demographicsKey
      })

      // Merge new skip questions with already skipped ones
      questionsToSkip = lodash.union(questionsToSkip, alreadySkipped)

      // Get next question
      const nextQuestion = await Question.findOne({
        where: {
          id: { [Sequelize.Op.notIn]: questionsToSkip },
          survey_id: surveyId,
          [Sequelize.Op.or]: [
            { platforms: [] },
            { platforms: { [Sequelize.Op.contains]: [platform] } }
          ],
          order: { [Sequelize.Op.gt]: question.order }
        },
        order: [['order', 'ASC']]
      })

      // Update or Create ParticipantSurvey entry
      if (participantSurvey) {
        const prevStatus = participantSurvey.status
        const status = nextQuestion ? 'in_progress' : 'completed'

        await participantSurvey.update({
          status,
          lastAnsweredQuestionId: question.id,
          skippedQuestions: questionsToSkip
        })

        if (status === 'completed' && prevStatus !== 'completed') {
          const newCompletedCount = survey.completedCount + 1
          const newState =
            survey.maxCompletionLimit &&
            survey.maxCompletionLimit <= newCompletedCount
              ? 'completed'
              : survey.state
          await survey.update({
            completedCount: newCompletedCount,
            state: newState
          })

          if (participant.phone) {
            // Send Incentives
            await request.post({
              uri: `${config.constants.URL}/africas-talking-send-airtime`,
              body: {
                data: {
                  phones: [participant.phone],
                  amount: `${survey.currency} ${survey.incentive}`,
                  surveyId: survey.id
                }
              },
              json: true
            })
          }
        }
      } else {
        await ParticipantSurvey.create({
          participantId,
          surveyId,
          status: 'in_progress',
          lastAnsweredQuestionId: question.id,
          skippedQuestions: questionsToSkip
        })
      }

      ctx.body = {
        data: {
          status: nextQuestion ? 'in_progress' : 'completed',
          answeredQuestionId: question.id,
          nextQuestionId: nextQuestion ? nextQuestion.id : -1,
          reply: nextQuestion ? undefined : survey.completionString
        }
      }
    }
  },

  fetchData: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      let message = '-------------------------------------\n'

      const questions = await Question.findAll({
        where: { surveyId },
        order: [['order']]
      })
      for (const { id: questionId, question, questionType } of questions) {
        message += `Answers for Question ID [${questionId}] - Asked [${question}]\n`
        const participantAnswers = await ParticipantAnswer.findAll({
          where: { questionId }
        })
        for (const { participantId, answers } of participantAnswers) {
          let answer = answers[0]
          if (questionType === 'mcq') {
            const prefedefinedAnswers = await PredefinedAnswer.findAll({
              where: { answerKey: { [Sequelize.Op.in]: answers } }
            })
            answer = prefedefinedAnswers
              .map(({ answerValue }) => answerValue)
              .join()
          }

          const participant = await Participant.findOne({
            where: { id: participantId }
          })
          message += `Participant ID ${participantId}, Phone ${
            participant
              ? participant.phone
              : participant.facebookId
                ? participant.facebookId
                : 'unknown'
          } answered the followings:\n\t${answer}\n`
        }
        message += '\n'
      }

      ctx.body = { message }
    }
  },
  saveData: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const writer = csvWriter({
        path: 'participantAnswers.csv',
        header: [
          { id: 'qid', title: 'Question ID' },
          { id: 'question', title: 'Question' },
          { id: 'pid', title: 'Participant ID' },
          { id: 'phone', title: 'Participant Phone' },
          { id: 'answer', title: 'Participant Answer' }
        ]
      })

      let records = []
      const questions = await Question.findAll({
        where: { surveyId },
        order: [['order']]
      })
      for (const { id: questionId, question, questionType } of questions) {
        const participantAnswers = await ParticipantAnswer.findAll({
          where: { questionId }
        })
        for (const { participantId, answers } of participantAnswers) {
          let tmpRow = {}
          tmpRow.qid = questionId
          tmpRow.question = question

          let answer = answers[0]
          if (questionType === 'mcq') {
            const prefedefinedAnswers = await PredefinedAnswer.findAll({
              where: { answerKey: { [Sequelize.Op.in]: answers } }
            })
            answer = prefedefinedAnswers
              .map(({ answerValue }) => answerValue)
              .join()
          }

          const participant = await Participant.findOne({
            where: { id: participantId }
          })
          tmpRow.pid = participantId
          tmpRow.phone = participant
            ? participant.phone
            : participant.facebookId
              ? participant.facebookId
              : 'unknown'

          tmpRow.answer = answer
          records.push(tmpRow)
        }
      }
      console.log(records)
      await writer.writeRecords(records)
      ctx.body = {}
    }
  }
})
