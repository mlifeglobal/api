module.exports = (request, config, Bluebird, qs, axios) => ({
  createSurvey: {
    async method (ctx) {
      const { token, text, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }
      const dialogObj = {
        token: process.env.slackAccessToken,
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Create a Survey',
          callback_id: 'survey-create',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Name',
              type: 'text',
              name: 'name',
              value: text,
              hint: 'survey name'
            },
            {
              label: 'Description',
              type: 'textarea',
              name: 'description'
            },
            {
              label: 'Intro String',
              type: 'textarea',
              name: 'introString'
            },
            {
              label: 'Completion String',
              type: 'textarea',
              name: 'completionString'
            },
            {
              label: 'Incentive',
              type: 'text',
              name: 'incentive',
              subtype: 'number',
              value: 0
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      const response = await axios.post(
        'https://slack.com/api/dialog.open',
        qs.stringify(dialogObj)
      )
      ctx.body = ''
    }
  },

  addQuestion: {
    async method (ctx) {
      const { token, text, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      const {
        data: { surveys }
      } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-all`,
        body: {
          secret: process.env.apiSecret
        },
        json: true
      })

      let optionsObj = []
      for (var survey of surveys) {
        optionsObj.push({ label: survey.name, value: survey.id })
      }
      const dialogObj = {
        token: process.env.slackAccessToken,
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Add question to survey',
          callback_id: 'question-create',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Surveys',
              type: 'select',
              name: 'surveyId',
              options: optionsObj
            },
            {
              label: 'Question',
              type: 'textarea',
              name: 'question'
            },
            {
              label: 'Question Type',
              type: 'select',
              name: 'questionType',
              options: [
                {
                  label: 'Multiple Choice',
                  value: 'mcq'
                },
                {
                  label: 'Open Question',
                  value: 'open'
                },
                {
                  label: 'Matrix',
                  value: 'matrix'
                }
              ]
            },
            {
              label: 'Answer Type',
              type: 'select',
              name: 'answerType',
              options: [
                {
                  label: 'Multiple',
                  value: 'multiple'
                },
                {
                  label: 'Single',
                  value: 'single'
                }
              ]
            },
            {
              label: 'Predefined Answers',
              type: 'textarea',
              name: 'predefinedAnswers',
              optional: true
            }
          ]
        })
      }
      const response = await axios.post(
        'https://slack.com/api/dialog.open',
        qs.stringify(dialogObj)
      )
      ctx.body = ''
    }
  },
  publishSurvey: {
    async method (ctx) {
      const { token, text, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      const {
        data: { surveys }
      } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-all`,
        body: {
          secret: process.env.apiSecret
        },
        json: true
      })

      let optionsObj = []
      for (var survey of surveys) {
        optionsObj.push({ label: survey.name, value: survey.id })
      }

      const dialogObj = {
        token: process.env.slackAccessToken,
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Publish Survey',
          callback_id: 'survey-publish',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Surveys',
              type: 'select',
              subtype: 'number',
              name: 'surveyId',
              options: optionsObj
            },
            {
              label: 'Platforms',
              name: 'platforms',
              type: 'textarea'
            }
          ]
        })
      }

      const response = await axios.post(
        'https://slack.com/api/dialog.open',
        qs.stringify(dialogObj)
      )
      ctx.body = ''
    }
  },
  commandResponse: {
    async method (ctx) {
      const body = JSON.parse(ctx.request.body.payload)

      Object.keys(body.submission).forEach(k => {
        // Delete null elements
        if (!body.submission[k]) {
          delete body.submission[k]
        }
        // Convert strings to int
        if (!isNaN(+body.submission[k])) {
          body.submission[k] = +body.submission[k]
        }
      })
      console.log(body.submission)

      const response = await request.post({
        uri: `${config.constants.URL}/admin/${body.callback_id}`,
        body: {
          secret: process.env.apiSecret,
          data: body.submission
        },
        json: true
      })
      console.log(response)
      ctx.body = ''
    }
  }
})
