module.exports = (Sequelize, Bluebird, Survey, lodash) => ({
  create: {
    schema: [
      [
        'data',
        true,
        [['name', true], ['description', true], ['incentive', true, 'integer']]
      ]
    ],
    async method(ctx) {
      const {
        data: { name, description, incentive }
      } = ctx.request.body

      const survey = await Survey.create({ name, description, incentive })

      ctx.body = { data: { surveyId: survey.id } }
    }
  },
  delete: {
    schema: [['data', true, [['surveyId', true, 'integer']]]],
    async method(ctx) {
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
          ['incentive', 'integer']
        ]
      ]
    ],
    async method(ctx) {
      const {
        data: { surveyId, name, description, incentive }
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
    async method(ctx) {
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
    async method(ctx) {
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
        platforms: lodash.remove(
          survey.platforms,
          platform => !platforms.includes(platform)
        ),
        state: 'uninitiated'
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
    async method(ctx) {
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
    async method(ctx) {
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
          platform => !optInCodes.includes(platform)
        )
      })

      ctx.body = { data: { surveyId: survey.id } }
    }
  },
  changeState: {
    schema: [['data', true, [['surveyId', true, 'integer'], ['state', true]]]],
    async method(ctx) {
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
    onError(error) {
      if (error instanceof Sequelize.DatabaseError) {
      }
    }
  }
})
