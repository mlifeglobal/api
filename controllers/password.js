module.exports = (User, Bluebird, moment) => ({
  request: {
    schema: [['data', true, [['email', true]]]],
    async method (ctx) {
      const {
        data: { email }
      } = ctx.request.body
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return Bluebird.reject([
          {
            key: 'email',
            value:
              'There is no user with such email. Please, try another or sign up.'
          }
        ])
      }
      await user.generateRestorePasswordToken()

      ctx.body = {}
    }
  },
  reset: {
    schema: [['data', true, [['password', true], ['code', true]]]],
    async method (ctx) {
      const {
        data: { password, code }
      } = ctx.request.body
      const user = await User.findOne({
        where: { restorePasswordToken: code }
      })

      let errorValue
      if (!user) {
        errorValue = 'You provided wrong code.'
      } else if (moment() > moment(user.restorePasswordTokenExpiresAt)) {
        errorValue = `Password can't be changed. Please, try again`
      }

      if (errorValue) {
        return Bluebird.reject([
          {
            key: 'password',
            value: errorValue
          }
        ])
      }

      user.hashPassword(password)
      user.restorePasswordToken = null
      user.restorePasswordTokenExpiresAt = null
      await user.save()

      ctx.body = {}
    }
  }
})
