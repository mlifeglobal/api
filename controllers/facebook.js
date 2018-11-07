module.exports = (request, config, Configs, Bluebird) => ({
  receive: {
    async method (ctx) {
      const { object, entry } = ctx.request.body

      if (object === 'page') {
        const { messaging } = entry[0]
        const {
          sender: { id: senderId },
          message: messageObj,
          postback: postbackObj
        } = messaging[0]

        const pageId = entry[0].id

        if (messageObj) {
          const { mid: messageId, text: msg } = messageObj

          const {
            data: { reply, questionData }
          } = await request.post({
            uri: `${config.constants.URL}/admin/filler-process`,
            body: {
              secret: process.env.apiSecret,
              data: {
                identifier: senderId,
                message: msg,
                platform: 'facebook',
                messageIdentifier: messageId
              }
            },
            json: true
          })

          if (reply) {
            let quickReplies = []
            if (questionData && questionData.answers) {
              quickReplies = Object.keys(questionData.answers).map(
                answerKey => ({
                  content_type: 'text',
                  title: answerKey,
                  payload: answerKey
                })
              )
            }

            await request.post({
              uri: `${config.constants.URL}/facebook-send`,
              body: {
                data: {
                  pageId,
                  facebookId: senderId,
                  message: reply,
                  quickReplies
                }
              },
              json: true
            })
          }
        } else if (postbackObj) {
          const { payload } = postbackObj

          if (payload === 'get_started_clicked') {
            await request.post({
              uri: `${config.constants.URL}/facebook-send`,
              body: {
                data: {
                  pageId,
                  facebookId: senderId,
                  message:
                    'Welcome, please reply with valid opt in code to start filling surveys.'
                }
              },
              json: true
            })
          }
        }
      }

      ctx.body = {}
    }
  },

  send: {
    schema: [
      [
        'data',
        true,
        [
          ['pageId', true],
          ['facebookId', true],
          ['message', true],
          ['quickReplies', 'array']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { pageId, facebookId, message, quickReplies }
      } = ctx.request.body

      const messageData = { text: message }
      if (quickReplies && quickReplies.length) {
        messageData['quick_replies'] = quickReplies
      }

      let token = await Configs.findOne({ where: { key: pageId } })
      if (!token) {
        return Bluebird.reject([
          {
            key: 'token',
            value: 'The bot has not been subscribed to this page'
          }
        ])
      }
      await request.post({
        uri: `${config.constants.FACEBOOK_API}/messages?access_token=${
          token.value
        }`,
        body: {
          recipient: {
            id: facebookId
          },
          message: messageData
        },
        json: true
      })

      ctx.body = {}
    }
  }
})
