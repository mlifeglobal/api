module.exports = (
  Sequelize,
  Bluebird,
  Survey,
  ParticipantSurvey,
  IncentiveRecord,
  lodash,
  Question,
  config,
  request
) => ({
  create: {
    schema: [
      [
        'data',
        true,
        [
          ['name', true],
          ['description', true],
          ['introString', true],
          ['completionString', true],
          ['incentive', true, 'integer'],
          ['currency', true]
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          name,
          description,
          introString,
          completionString,
          incentive,
          currency
        }
      } = ctx.request.body

      const survey = await Survey.create({
        name,
        description,
        introString,
        completionString,
        incentive,
        currency
      })

      ctx.body = {
        data: `Survey has succesfully created for id: ${survey.id}`,
        surveyId: survey.id
      }
    }
  },
  delete: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      await Survey.destroy({ where: { id: surveyId } })

      ctx.body = {
        data: `Survey has succesfully deleted for id: ${survey.id}`
      }
    }
  },
  update: {
    schema: [
      [
        'data',
        true,
        [
          ['surveyId', true, 'integer'],
          ['name'],
          ['description'],
          ['introString'],
          ['completionString'],
          ['incentive', 'integer'],
          ['optInCodes', 'array'],
          ['initCodes', 'array'],
          ['platforms', 'array'],
          ['currency']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          surveyId,
          name,
          description,
          introString,
          completionString,
          incentive,
          optInCodes: givenOptInCodes,
          initCodes,
          platforms,
          currency
        }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }
      let optInCodes
      if (givenOptInCodes) {
        optInCodes = givenOptInCodes.map(code => code.toLowerCase())

        const optInCodesInUse = await Survey.optInCodesInUse(
          optInCodes,
          survey.id
        )
        if (optInCodesInUse.length > 0) {
          ctx.body = {
            ok: false,
            data: `Opt in codes ${optInCodesInUse.join()} are already in use by other active surveys.`
          }
          return
        }
      }

      let updateObj = {}
      if (name) updateObj.name = name
      if (description) updateObj.description = description
      if (introString) updateObj.introString = introString
      if (completionString) updateObj.completionString = completionString
      if (incentive !== undefined) updateObj.incentive = incentive
      if (optInCodes) updateObj.optInCodes = optInCodes
      if (initCodes) updateObj.initCodes = initCodes
      if (platforms) updateObj.platforms = platforms
      if (currency) updateObj.currency = currency

      await survey.update(updateObj)
      const updatedSurvey = await Survey.findOne({ where: { id: surveyId } })
      ctx.body = {
        data: `Survey has succesfully updated for id: ${survey.id}`,
        survey: updatedSurvey
      }
    }
  },
  publish: {
    schema: [
      [
        'data',
        true,
        [['surveyId', true, 'integer'], ['platforms', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, platforms }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      await survey.update({
        platforms: lodash.union(survey.platforms, platforms),
        state: 'in_progress'
      })

      ctx.body = {
        data: `Survey has succesfully published for id: ${survey.id}`
      }
    }
  },
  updatePlatforms: {
    schema: [
      [
        'data',
        true,
        [['surveyId', true, 'integer'], ['platforms', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, platforms }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      await survey.update({
        platforms
      })

      ctx.body = {
        data: `Survey has succesfully published for id: ${survey.id}`
      }
    }
  },
  toggleState: {
    schema: [['data', true, [['surveyId', true, 'integer'], ['state', true]]]],
    async method (ctx) {
      const {
        data: { surveyId, state }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      await survey.update({
        state: state === 'in_progress' ? 'uninitiated' : 'in_progress'
      })

      const updatedSurvey = await Survey.findOne({ where: { id: surveyId } })
      ctx.body = {
        survey: updatedSurvey
      }
    }
  },
  unpublish: {
    schema: [
      [
        'data',
        true,
        [['surveyId', true, 'integer'], ['platforms', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, platforms }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      const updatedPlatforms = lodash.remove(
        survey.platforms,
        platform => !platforms.includes(platform)
      )
      await survey.update({
        platforms: updatedPlatforms,
        state: updatedPlatforms.length ? 'in_progress' : 'uninitiated'
      })

      ctx.body = {
        data: `Survey has succesfully unpublished from ${platforms} for id: ${
          survey.id
        }`
      }
    }
  },
  addOptInCodes: {
    schema: [
      [
        'data',
        true,
        [['surveyId', true, 'integer'], ['optInCodes', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, optInCodes: givenOptInCodes }
      } = ctx.request.body
      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      const optInCodes = givenOptInCodes.map(code => code.toLowerCase())

      const optInCodesInUse = await Survey.optInCodesInUse(
        optInCodes,
        survey.id
      )
      if (optInCodesInUse.length > 0) {
        ctx.body = {
          ok: false,
          data: `Opt in codes ${optInCodesInUse.join()} are already in use by other active surveys.`
        }
        return
      }

      await survey.update({
        optInCodes: lodash.union(survey.optInCodes, optInCodes)
      })
      const updatedSurvey = await Survey.findOne({ where: { id: surveyId } })

      ctx.body = {
        data: `Opt in codes has been added for id: ${survey.id}`,
        survey: updatedSurvey
      }
    }
  },
  removeOptInCodes: {
    schema: [
      [
        'data',
        true,
        [['surveyId', true, 'integer'], ['optInCodes', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, optInCodes: givenOptInCodes }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      const optInCodes = givenOptInCodes.map(code => code.toLowerCase())

      await survey.update({
        optInCodes: lodash.remove(
          survey.optInCodes,
          code => !optInCodes.includes(code)
        )
      })

      ctx.body = {
        data: `Opt in codes removed from survey : ${survey.id}`
      }
    }
  },
  addInitCodes: {
    schema: [
      [
        'data',
        true,
        [['surveyId', true, 'integer'], ['initCodes', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, initCodes: givenInitCodes }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      const initCodes = givenInitCodes.map(code => code.toLowerCase())

      await survey.update({
        initCodes: lodash.union(survey.initCodes, initCodes)
      })
      const updatedSurvey = await Survey.findOne({ where: { id: surveyId } })

      ctx.body = {
        data: `Init codes have been added to survey : ${survey.id}`,
        survey: updatedSurvey
      }
    }
  },
  removeInitCodes: {
    schema: [
      [
        'data',
        true,
        [['surveyId', true, 'integer'], ['initCodes', true, 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, initCodes: givenInitCodes }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      const initCodes = givenInitCodes.map(code => code.toLowerCase())

      await survey.update({
        initCodes: lodash.remove(
          survey.initCodes,
          code => !initCodes.includes(code)
        )
      })

      ctx.body = {
        data: `Init codes have been removed from survey:  ${survey.id}`
      }
    }
  },
  changeState: {
    schema: [['data', true, [['surveyId', true, 'integer'], ['state', true]]]],
    async method (ctx) {
      const {
        data: { surveyId, state }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      survey.update({ state })
      ctx.body = {
        data: `Survey state has succesfully changed for id: ${survey.id}`
      }
    },
    onError (error) {
      if (error instanceof Sequelize.DatabaseError) {
      }
    }
  },
  getAll: {
    async method (ctx) {
      const surveys = await Survey.findAll({
        where: { state: { [Sequelize.Op.ne]: 'completed' } },
        raw: true
      })

      ctx.body = { data: { surveys } }
    }
  },
  getClientSurveys: {
    schema: [
      [
        'data',
        true,
        [
          ['clientID', true, 'integer'],
          ['offset', true, 'integer'],
          ['limit', true, 'integer']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { clientID, offset, limit }
      } = ctx.request.body

      const query = {
        attributes: {
          include: [
            [
              Sequelize.fn('COUNT', Sequelize.col('questions.id')),
              'questionsCount'
            ]
          ]
        },
        include: [
          {
            model: Question,
            attributes: [],
            duplicating: false
          }
        ],
        group: ['survey.id'],
        where: { clientID },
        offset
      }
      if (limit > 0) {
        query.limit = limit
      }
      const surveys = await Survey.findAll(query)
      const surveysCount = await Survey.count()
      ctx.body = {
        data: {
          surveys,
          surveysCount
        }
      }
    }
  },
  getCurrent: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const query = {
        attributes: {
          include: [
            [
              Sequelize.fn('COUNT', Sequelize.col('questions.id')),
              'questionsCount'
            ]
          ]
        },
        include: [
          {
            model: Question,
            attributes: [],
            duplicating: false
          }
        ],
        group: ['survey.id'],
        where: { id: surveyId }
      }

      const survey = await Survey.findOne(query)
      ctx.body = {
        survey
      }
    }
  },
  getQuestions: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      const questions = await Question.findAll({
        where: { surveyId },
        order: [['order']],
        raw: true
      })

      let questionsObj = '-------------------------------------\n'
      questionsObj += `Questions for survey ${surveyId}\n\n`

      for (var question of questions) {
        if (question.questionType === 'open') {
          questionsObj += 'ID ' + question.id + ' - ' + question.question + '\n'
        } else {
          const {
            data: { questionData }
          } = await request.post({
            uri: `${config.constants.URL}/admin/question-format`,
            body: {
              secret: process.env.apiSecret,
              data: { questionId: question.id }
            },
            json: true
          })

          questionsObj +=
            'ID ' +
            question.id +
            ' - ' +
            questionData.question +
            '\n\t\t' +
            JSON.stringify(questionData.answers) +
            '\n'
        }
      }
      ctx.body = {
        data: questionsObj
      }
    }
  },
  getQuestionsObj: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const { survey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-current`,
        body: {
          secret: process.env.apiSecret,
          data: { surveyId }
        },
        json: true
      })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      const questions = await Question.findAll({
        where: { surveyId },
        order: [['order']],
        raw: true
      })
      let questionsObj = []

      for (var question of questions) {
        if (question.questionType === 'open') {
          questionsObj.push({
            id: question.id,
            type: 'open',
            question: question.question,
            answerType: question.answerType
          })
        } else {
          const {
            data: { answers }
          } = await request.post({
            uri: `${config.constants.URL}/admin/question-get-predef-answers`,
            body: {
              secret: process.env.apiSecret,
              data: { questionId: question.id }
            },
            json: true
          })
          questionsObj.push({
            id: question.id,
            type: 'mcq',
            question: question.question,
            answerType: question.answerType,
            answers
          })
        }
      }
      ctx.body = {
        data: questionsObj,
        currentSurvey: survey
      }
    }
  },
  liveData: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      let message = '-------------------------------------\n'

      message += "PARTICIPANTS' INTERACTION INFO:\n"
      const participants = {
        intro: 0,
        initiated: 0,
        in_progress: 0,
        completed: 0
      }

      const participantSurveys = await ParticipantSurvey.findAll({
        where: { surveyId }
      })
      for (const { status } of participantSurveys) {
        participants[status] += 1
      }

      if (participants.intro) {
        message += `Intro sent - count [${participants.intro}]\n`
      }
      if (participants.initiated) {
        message += `Initiated - count [${participants.initiated}]\n`
      }
      if (participants.in_progress) {
        message += `Currently filling - count [${participants.in_progress}]\n`
      }
      if (participants.completed) {
        message += `Completed - count [${participants.completed}]\n`
      }

      // Get Incentive Cost
      let totalAmount = 0
      let phoneNumbers = []
      const successfulIncentives = await IncentiveRecord.findAll({
        where: { surveyId, status: 'Success' }
      })
      for (const { amount, phone } of successfulIncentives) {
        totalAmount += parseInt(amount.split(' ')[1])
        phoneNumbers.push(phone)
      }
      message += `\nTotal Incentives Sent Successfully - count [${totalAmount} ${
        survey.currency
      }], phone numbers [${phoneNumbers.join()}] `

      ctx.body = { data: { participants }, message }
    }
  }
})
