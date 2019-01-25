module.exports = (Question, Survey, request, config, Bluebird, fs) => ({
  createSurvey: {
    async method (ctx) {
      const { token, text, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }
      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Create a Survey',
          callback_id: 'admin/survey-create',
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
              value: '0 KES'
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  addQuestion: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

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
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Add question to survey',
          callback_id: 'admin/question-create',
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
              ],
              optional: true
            },
            {
              label: 'Predefined Answers',
              type: 'textarea',
              name: 'predefinedAnswers',
              optional: true,
              placeholder:
                '{"a": { "value": "option a" },\n "b": { "value": "option b", , "skipQuestions":[question IDs] },\n "c": { "value": "option c" }}'
            }
          ]
        })
      }
      const res = await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      console.log(res)
      ctx.body = ''
    }
  },

  setBranch: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }
      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Set Branch ',
          callback_id: 'admin/question-set-branch-slack',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Question ID',
              type: 'text',
              name: 'questionId',
              placeholder: 'Source question ID'
            },
            {
              label: 'Option',
              type: 'text',
              name: 'option',
              placeholder: 'Answer Key'
            },
            {
              label: 'Questions to Skip',
              type: 'text',
              name: 'skipQuestions',
              placeholder: 'Comma seperated question IDs to skip'
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  publishSurvey: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

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
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Publish Survey',
          callback_id: 'admin/survey-publish',
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

      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  unpublishSurvey: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

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
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Unpublish Survey',
          callback_id: 'admin/survey-unpublish',
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

      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  updateSurvey: {
    async method (ctx) {
      const { token, text, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      if (!text) {
        ctx.body = 'Correct syntax: /updatesurvey [surveyID]'
        return
      }

      const survey = await Survey.findOne({ where: { id: text } })
      if (!survey) {
        return Bluebird.reject([{ key: 'Error', value: `Survey not found` }])
      }
      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Update a Survey',
          callback_id: 'admin/survey-update',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Survey ID',
              type: 'text',
              name: 'surveyId',
              hint: 'do not touch',
              value: survey.id
            },
            {
              label: 'Name',
              type: 'text',
              name: 'name',
              hint: 'survey name',
              value: survey.name
            },
            {
              label: 'Description',
              type: 'textarea',
              name: 'description',
              value: survey.description
            },
            {
              label: 'Intro String',
              type: 'textarea',
              name: 'introString',
              value: survey.introString
            },
            {
              label: 'Completion String',
              type: 'textarea',
              name: 'completionString',
              value: survey.completionString
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  updateSurveyPublish: {
    async method (ctx) {
      const { token, text, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      if (!text) {
        ctx.body = 'Correct syntax: /updatepublishinfo [surveyID]'
        return
      }

      const survey = await Survey.findOne({ where: { id: text } })
      if (!survey) {
        return Bluebird.reject([{ key: 'Error', value: `Survey not found` }])
      }

      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Update a Survey',
          callback_id: 'admin/survey-update',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Survey ID',
              type: 'text',
              name: 'surveyId',
              hint: 'do not touch',
              value: survey.id
            },
            {
              label: 'Platforms',
              type: 'text',
              name: 'platforms',
              hint: 'survey platforms',
              value: survey.platforms.join(),
              optional: true
            },
            {
              label: 'Opt-in Codes',
              type: 'text',
              name: 'optInCodes',
              value: survey.optInCodes.join(),
              optional: true
            },
            {
              label: 'Init Codes',
              type: 'text',
              name: 'initCodes',
              value: survey.initCodes.join(),
              optional: true
            },
            {
              label: 'Incentive',
              type: 'text',
              name: 'incentive',
              value: survey.incentive + ' ' + survey.currency,
              optional: true
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  updateQuestion: {
    async method (ctx) {
      const { token, text, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      if (!text) {
        ctx.body = 'Correct syntax: /updatequestion [questionID]'
        return
      }

      const question = await Question.findOne({ where: { id: text } })
      if (!question) {
        return Bluebird.reject([{ key: 'Error', value: `Question not found` }])
      }
      const {
        data: { answers }
      } = await request.post({
        uri: `${config.constants.URL}/admin/question-get-predef-answers`,
        body: {
          secret: process.env.apiSecret,
          data: { questionId: question.id }
        },
        json: true
      })

      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Update Question',
          callback_id: 'admin/question-update',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Question Id',
              type: 'text',
              name: 'questionId',
              value: question.id,
              hint: 'do not change'
            },
            {
              label: 'Question',
              type: 'textarea',
              name: 'question',
              value: question.question
            },
            {
              label: 'Question Type',
              type: 'select',
              name: 'questionType',
              value: question.questionType,
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
              value: question.answerType,
              optional: true,
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
              optional: true,
              value: JSON.stringify(answers),
              placeholder:
                '{"a": { "value": option a, skipQuestions:[question IDs] },\n "b": { "value": option b },\n "c": { "value": option c }}'
            }
          ]
        })
      }
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  bulkSms: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }
      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Send Bulk Sms ',
          callback_id: 'africas-talking-bulk-sms',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Phone numbers',
              type: 'text',
              name: 'numbers',
              placeholder: 'Comma separated full phone numbers'
            },
            {
              label: 'Message',
              type: 'textarea',
              name: 'message',
              placeholder: 'The message you want to send out'
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  bulkAirtime: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

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
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Send Bulk Airtime ',
          callback_id: 'africas-talking-bulk-airtime',
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
              label: 'Phone numbers',
              type: 'text',
              name: 'numbers',
              placeholder: 'Comma separated full phone numbers'
            },
            {
              label: 'Incentive',
              type: 'text',
              name: 'incentive',
              subtype: 'number',
              value: '0 KES'
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  createDemographic: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Create Demographics',
          callback_id: 'admin/question-create-demographics',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Demographic key',
              type: 'text',
              name: 'key',
              placeholder: 'Must be unique'
            },
            {
              label: 'Validation',
              type: 'textarea',
              name: 'validation',
              placeholder: 'Regular Expression for validation',
              optional: true
            },
            {
              label: 'Validation Message',
              type: 'textarea',
              name: 'validationMsg',
              placeholder: 'Validation error message',
              optional: true
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },
  attachDemographic: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Attach Demographics',
          callback_id: 'admin/question-attach-demographics',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Question ID',
              type: 'text',
              name: 'questionId'
            },
            {
              label: 'Demographic key',
              type: 'text',
              name: 'demographicsKey'
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },
  uploadFbToken: {
    async method (ctx) {
      const { token, trigger_id } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      const dialogObj = {
        trigger_id: trigger_id,
        dialog: JSON.stringify({
          title: 'Upload FB page token',
          callback_id: 'admin/system-config-upload',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Facebook Page ID',
              type: 'text',
              name: 'key'
            },
            {
              label: 'Access Token',
              type: 'textarea',
              name: 'value'
            },
            {
              label: 'Page name',
              type: 'text',
              name: 'token'
            },
            {
              label: 'Description',
              type: 'text',
              name: 'description'
            }
          ]
        })
      }
      // open the dialog by calling dialogs.open method and sending the payload
      await request.post({
        uri: `${config.constants.URL}/slack-open-dialog`,
        body: dialogObj,
        json: true
      })
      ctx.body = ''
    }
  },

  getQuestions: {
    async method (ctx) {
      const { token, text } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      if (!text) {
        ctx.body = 'Correct syntax: /getSurveyQuestions [surveyID]'
        return
      }

      const survey = await Survey.findOne({ where: { id: text } })
      if (!survey) {
        return Bluebird.reject([{ key: 'Error', value: `Survey not found` }])
      }

      const response = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions`,
        body: {
          secret: process.env.apiSecret,
          data: { surveyId: survey.id }
        },
        json: true
      })

      await request.post({
        uri: process.env.slackWebhookURL,
        body: { text: response.data },
        json: true
      })
      ctx.body = ''
    }
  },

  systemInfo: {
    async method (ctx) {
      const { token } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      const { message } = await request.post({
        uri: `${config.constants.URL}/admin/system-info`,
        body: {
          secret: process.env.apiSecret
        },
        json: true
      })

      await request.post({
        uri: process.env.slackWebhookURL,
        body: { text: message },
        json: true
      })
      ctx.body = ''
    }
  },

  liveSurveyData: {
    async method (ctx) {
      const { token, text } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      if (!text) {
        ctx.body = 'Correct syntax: /livesurveydata [surveyID]'
        return
      }

      const survey = await Survey.findOne({ where: { id: text } })
      if (!survey) {
        return Bluebird.reject([{ key: 'Error', value: `Survey not found` }])
      }

      const { message } = await request.post({
        uri: `${config.constants.URL}/admin/survey-live-data`,
        body: {
          secret: process.env.apiSecret,
          data: { surveyId: survey.id }
        },
        json: true
      })

      await request.post({
        uri: process.env.slackWebhookURL,
        body: { text: message },
        json: true
      })

      ctx.body = ''
    }
  },

  getParticipantData: {
    async method (ctx) {
      const { token, text } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      if (!text) {
        ctx.body = 'Correct syntax: /getparticipantdata [surveyID]'
        return
      }

      const survey = await Survey.findOne({ where: { id: text } })
      if (!survey) {
        return Bluebird.reject([{ key: 'Error', value: `Survey not found` }])
      }

      const { message } = await request.post({
        uri: `${config.constants.URL}/admin/participant-fetch-data`,
        body: {
          secret: process.env.apiSecret,
          data: { surveyId: survey.id }
        },
        json: true
      })

      await request.post({
        uri: process.env.slackWebhookURL,
        body: { text: message },
        json: true
      })

      ctx.body = ''
    }
  },
  getParticipantDataFile: {
    async method (ctx) {
      const { token, text } = ctx.request.body

      if (token !== process.env.slackVerificationToken) {
        return Bluebird.reject([
          { key: 'Access Denied', value: `Incorrect Verification Token` }
        ])
      }

      if (!text) {
        ctx.body = 'Correct syntax: /getparticipantdatafile [surveyID]'
        return
      }

      const survey = await Survey.findOne({ where: { id: text } })
      if (!survey) {
        return Bluebird.reject([{ key: 'Error', value: `Survey not found` }])
      }

      request.post({
        uri: process.env.slackWebhookURL,
        body: { text: 'Please wait while we prepare the results.' },
        json: true
      })

      await request.post({
        uri: `${config.constants.URL}/admin/participant-save-data`,
        body: {
          secret: process.env.apiSecret,
          data: { surveyId: survey.id }
        },
        json: true
      })

      request.post({
        uri: `${config.constants.SLACK_API}/files.upload`,
        headers: {
          Authorization: `Bearer ${process.env.slackAccessToken}`
        },
        formData: {
          file: fs.createReadStream(
            `survey${survey.id}_participant_answers.csv`
          ),
          channels: process.env.slackChannel,
          initial_comment: 'Participant Answers'
        }
      })

      ctx.body = ''
    }
  },
  commandResponse: {
    async method (ctx) {
      const body = JSON.parse(ctx.request.body.payload)

      let arrayObjs = [
        'skipQuestions',
        'platforms',
        'optInCodes',
        'initCodes',
        'numbers'
      ]

      Object.keys(body.submission).forEach(k => {
        // Delete null elements
        if (!body.submission[k] || body.submission[k] === undefined) {
          delete body.submission[k]
        }
        // Convert string to json object
        if (
          'predefinedAnswers' in body.submission &&
          k === 'predefinedAnswers'
        ) {
          body.submission[k] = JSON.parse(body.submission[k])
        }
        if (k === 'incentive') {
          let tmp = body.submission[k].split(' ')
          body.submission['incentive'] = +tmp[0]
          body.submission['currency'] = tmp[1]
        }
        if (arrayObjs.indexOf(k) > -1 && body.submission[k] !== undefined) {
          body.submission[k] = body.submission[k].replace(/\s/g, '').split(',')
        } else if (
          !(k === 'key' || k === 'option' || isNaN(+body.submission[k]))
        ) {
          // Convert strings to int
          body.submission[k] = +body.submission[k]
        }
      })

      const response = await request.post({
        uri: `${config.constants.URL}/${body.callback_id}`,
        body: {
          secret: process.env.apiSecret,
          data: body.submission
        },
        json: true
      })

      console.log(response.data)
      await request.post({
        uri: process.env.slackWebhookURL,
        body: { text: response.data },
        json: true
      })
      ctx.body = ''
    }
  },

  openDialog: {
    async method (ctx) {
      const body = ctx.request.body

      await request.post({
        uri: `${config.constants.SLACK_API}/dialog.open`,
        headers: {
          Authorization: `Bearer ${process.env.slackAccessToken}`
        },
        body,
        json: true
      })

      ctx.body = {}
    }
  }
})
