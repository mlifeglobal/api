module.exports = (request, config, Config, Bluebird, s3) => ({
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
                fbPageId: pageId,
                messageIdentifier: messageId
              }
            },
            json: true
          })

          if (reply) {
            console.log(questionData)

            let quickReplies = []
            let attachmentKey = ''
            if (questionData && questionData.answers) {
              quickReplies = Object.keys(questionData.answers).map(
                answerKey => ({
                  content_type: 'text',
                  title: answerKey,
                  payload: answerKey
                })
              )
            }

            if (questionData && questionData.attachmentKey) {
              attachmentKey = questionData.attachmentKey
            }
            await request.post({
              uri: `${config.constants.URL}/facebook-send`,
              body: {
                data: {
                  pageId,
                  facebookId: senderId,
                  message: reply,
                  quickReplies,
                  attachmentKey
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
          ['quickReplies', 'array'],
          ['attachmentKey']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { pageId, facebookId, message, quickReplies, attachmentKey }
      } = ctx.request.body

      let token = await Config.findOne({ where: { key: pageId } })
      if (!token) {
        return Bluebird.reject([
          {
            key: 'token',
            value: 'The bot has not been subscribed to this page'
          }
        ])
      }

      const messageData = { text: message }
      if (quickReplies && quickReplies.length) {
        messageData['quick_replies'] = quickReplies
      }
      if (attachmentKey) {
        const attachmentData = {}
        let attachment = {}

        attachment.payload = {
          url: attachmentKey,
          is_reusable: true
        }
        attachment.type = 'image'
        attachmentData.attachment = attachment

        await request.post({
          uri: `${config.constants.FACEBOOK_API}/me/messages?access_token=${
            token.value
          }`,
          body: {
            recipient: {
              id: facebookId
            },
            message: attachmentData
          },
          json: true
        })
      }

      await request.post({
        uri: `${config.constants.FACEBOOK_API}/me/messages?access_token=${
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
  },
  getPageIds: {
    schema: ['data', true, [['facebookId'], ['fbPageId']]],

    async method (ctx) {
      const {
        data: { facebookId, fbPageId }
      } = ctx.request.body

      let token = await Config.findOne({ where: { key: fbPageId } })
      if (!token) {
        return Bluebird.reject([
          {
            key: 'token',
            value: 'The bot has not been subscribed to this page'
          }
        ])
      }

      const ids = await request.get({
        uri: `${
          config.constants.FACEBOOK_API
        }/${facebookId}/ids_for_pages?access_token=${token.value}`,
        json: true
      })

      let fbIds = ''
      for (var pid of ids.data) {
        fbIds += `${pid.id},`
      }

      ctx.body = { fbIds }
    }
  }
})
