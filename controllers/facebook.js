module.exports = (request, config) => ({
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
        [['facebookId', true], ['message', true], ['quickReplies', 'array']]
      ]
    ],
    async method (ctx) {
      const {
        data: { facebookId, message, quickReplies }
      } = ctx.request.body

      const messageData = { text: message }
      if (quickReplies && quickReplies.length) {
        messageData['quick_replies'] = quickReplies
      }

      await request.post({
        uri: `${config.constants.FACEBOOK_API}/messages?access_token=${
          process.env.facebookPageAccessToken
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
