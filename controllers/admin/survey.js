module.exports = (Sequelize, Bluebird, Survey, lodash) => ({
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
          ['incentive', true, 'integer']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { name, description, introString, completionString, incentive }
      } = ctx.request.body

      const survey = await Survey.create({
        name,
        description,
        introString,
        completionString,
        incentive
      })

      ctx.body = { data: { surveyId: survey.id } }
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

      ctx.body = { data: { surveyId } }
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
          ['incentive', 'integer']
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
          incentive
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
      if (incentive) updateObj.incentive = incentive

      await survey.update(updateObj)

      ctx.body = { data: { surveyId: survey.id } }
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

      ctx.body = { data: { surveyId: survey.id } }
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

      ctx.body = { data: { surveyId: survey.id } }
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

      ctx.body = { data: { surveyId: survey.id } }
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

      ctx.body = { data: { surveyId: survey.id } }
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
      ctx.body = { data: { surveyId } }
    },
    onError (error) {
      if (error instanceof Sequelize.DatabaseError) {
      }
    }
  }
})
