module.exports = (
  Sequelize,
  Bluebird,
  Survey,
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

      await survey.destroy()

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
          optInCodes,
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

      ctx.body = {
        data: `Survey has succesfully updated for id: ${survey.id}`
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
        data: { surveyId, optInCodes }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      await survey.update({
        optInCodes: lodash.union(survey.optInCodes, optInCodes)
      })

      ctx.body = {
        data: `Opt in codes has been added for id: ${survey.id}`
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
        data: { surveyId, optInCodes }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

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
        data: { surveyId, initCodes }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

      await survey.update({
        initCodes: lodash.union(survey.initCodes, initCodes)
      })

      ctx.body = {
        data: `Init codes have been added to survey : ${survey.id}`
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
        data: { surveyId, initCodes }
      } = ctx.request.body

      const survey = await Survey.findOne({ where: { id: surveyId } })
      if (!survey) {
        return Bluebird.reject([
          { key: 'survey', value: `Survey not found for ID: ${surveyId}` }
        ])
      }

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
        raw: true
      })
      let questionsObj = `Questions for survey ${surveyId}\n\n`

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

          questionsObj += 'ID ' +
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
  }
})
