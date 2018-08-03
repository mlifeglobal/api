module.exports = (Bluebird, Survey) => ({
  add: {
    schema: [
      [
        'data',
        true,
        [['name', true], ['description', true], ['incentive', true, 'integer']]
      ]
    ],
    async method (ctx) {
      const {
        data: { name, description, incentive }
      } = ctx.request.body
      await Survey.create({ name, description, incentive })
      ctx.body = {}
    }
  }
})
