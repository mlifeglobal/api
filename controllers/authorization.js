module.exports = (User, Client, Bluebird) => ({
  signUp: {
    schema: [
      [
        'data',
        true,
        [
          ['firstName', true],
          ['lastName', true],
          ['email', true],
          ['password', true],
          ['clientCode', true]
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { firstName, lastName, email, password, clientCode }
      } = ctx.request.body

      const client = await Client.findOne({ where: { code: clientCode } })
      if (!client) {
        return Bluebird.reject([
          {
            key: 'Client',
            value: `Client code ${clientCode} is not valid. Please contact Mlife support to get valid code for your company.`
          }
        ])
      }

      let user = await User.findOne({ where: { email } })
      if (user) {
        user.firstName = firstName
        user.lastName = lastName
        user.clientID = client.id
        user.hashPassword(password)
        await user.save()
      } else {
        user = await User.create({
          email,
          password,
          firstName,
          lastName,
          clientID: client.id
        })
      }

      ctx.body = { data: user.getData() }
    }
  },
  logIn: {
    schema: [['data', true, [['email', true], ['password', true]]]],
    async method (ctx) {
      const {
        data: { email, password }
      } = ctx.request.body

      const user = await User.findOne({
        where: { email }
      })
      if (!user) {
        return Bluebird.reject([
          {
            key: 'email',
            value:
              'This email is not registered. Please double check for typos or sign up for an account.'
          }
        ])
      }
      if (!user.checkPassword(password)) {
        return Bluebird.reject([
          {
            key: 'password',
            value:
              'You provided an incorrect password. Please try again or reset your password.'
          }
        ])
      }

      ctx.body = { data: user.getData() }
    }
  }
})
