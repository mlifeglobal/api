module.exports = (Bluebird, JWT) => ({
  async before (ctx) {
    // Bearer Auth jwt checker
    const header = ctx.request.headers.authorization
    if (!header) {
      return Bluebird.reject({
        status: 401,
        errors: [{ key: 'unauthorized', value: 'no authorization header' }]
      })
    }
    const jwt = header.split(' ')[1]
    try {
      const participant = JWT.verify(jwt, process.env.key)
      ctx.authorized = participant
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return Bluebird.reject({
          status: 401,
          errors: [{ key: 'unauthorized', value: 'token is not valid' }]
        })
      } else throw error
    }
  }
})
