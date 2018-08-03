module.exports = () => ({
  async method (ctx) {
    ctx.body = { data: { response: 'Hello!' } }
  }
})
