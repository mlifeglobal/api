module.exports = (User, config, request) => ({
  getAll: {
    schema: [
      ['data', true, [['offset', true, 'integer'], ['limit', true, 'integer']]]
    ],
    async method (ctx) {
      const {
        data: { offset, limit }
      } = ctx.request.body

      const user = await User.findOne({ where: { id: ctx.authorized.id } })

      const {
        data: { surveys, surveysCount }
      } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-client-surveys`,
        body: {
          secret: process.env.apiSecret,
          data: { clientID: user.clientID, offset, limit }
        },
        json: true
      })

      ctx.body = { surveys, surveysCount }
    }
  },

  create: {
    schema: [
      [
        'data',
        true,
        [
          ['name', true],
          ['description', true],
          ['introString', true],
          ['completionString', true],
          ['incentive', true, 'integer'],
          ['currency', true]
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          name,
          description,
          introString,
          completionString,
          incentive,
          currency
        }
      } = ctx.request.body

      await request.post({
        uri: `${config.constants.URL}/admin/survey-create`,
        body: {
          secret: process.env.apiSecret,
          data: {
            name,
            description,
            introString,
            completionString,
            incentive,
            currency
          }
        },
        json: true
      })

      ctx.body = { data: 'Survey has been succesfully created' }
    }
  },
  updateDetails: {
    schema: [
      [
        'data',
        true,
        [
          ['surveyId', true, 'integer'],
          ['name', true],
          ['description', true],
          ['introString', true],
          ['completionString', true],
          ['incentive', true, 'integer'],
          ['currency', true]
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: {
          surveyId,
          name,
          description,
          introString,
          completionString,
          incentive,
          currency
        }
      } = ctx.request.body

      const { survey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-update`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId,
            name,
            description,
            introString,
            completionString,
            incentive,
            currency
          }
        },
        json: true
      })

      ctx.body = {
        survey,
        message: 'Survey details have been successfully updated'
      }
    }
  },
  updatePublish: {
    schema: [
      [
        'data',
        true,
        [
          ['surveyId', true, 'integer'],
          ['platforms', 'array'],
          ['optInCodes'],
          ['initCodes']
        ]
      ]
    ],
    async method (ctx) {
      const {
        data: { surveyId, platforms, optInCodes, initCodes }
      } = ctx.request.body
      if (platforms) {
        await request.post({
          uri: `${config.constants.URL}/admin/survey-update-platforms`,
          body: {
            secret: process.env.apiSecret,
            data: {
              surveyId,
              platforms
            }
          },
          json: true
        })
      }
      if (optInCodes) {
        const { data, ok } = await request.post({
          uri: `${config.constants.URL}/admin/survey-update`,
          body: {
            secret: process.env.apiSecret,
            data: {
              surveyId,
              optInCodes: optInCodes.split(',')
            }
          },
          json: true
        })
        if (ok === false) {
          const { survey } = await request.post({
            uri: `${config.constants.URL}/admin/survey-get-current`,
            body: {
              secret: process.env.apiSecret,
              data: {
                surveyId
              }
            },
            json: true
          })
          ctx.body = { message: data, survey }
          return
        }
      }

      if (initCodes) {
        await request.post({
          uri: `${config.constants.URL}/admin/survey-update`,
          body: {
            secret: process.env.apiSecret,
            data: {
              surveyId,
              initCodes: initCodes.split(',')
            }
          },
          json: true
        })
      }

      const { survey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-current`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      ctx.body = {
        survey,
        message: 'Platform details have been sucessfully updated'
      }
    }
  },
  changeState: {
    async method (ctx) {
      const {
        data: { surveyId, state }
      } = ctx.request.body

      const { survey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-toggle-state`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId,
            state
          }
        },
        json: true
      })
      ctx.body = {
        survey,
        message: 'Survey state has been succesfully updated'
      }
    }
  },

  getQuestions: {
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const { data } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      ctx.body = { questions: data }
    }
  },
  questionChangeOrder: {
    async method (ctx) {
      const {
        data: { surveyId, questionId1, questionId2 }
      } = ctx.request.body

      await request.post({
        uri: `${config.constants.URL}/admin/question-change-order`,
        body: {
          secret: process.env.apiSecret,
          data: {
            questionId1,
            questionId2
          }
        },
        json: true
      })

      const { data } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })

      ctx.body = {
        questions: data,
        message: 'Questions order has been succesfully updated'
      }
    }
  },
  getBranchingData: {
    async method (ctx) {
      const {
        data: { surveyId }
      } = ctx.request.body

      const { data } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      let questions = data
      let branchData = { nodeDataArray: [], linkDataArray: [] }
      var count = 0

      for (var question of questions) {
        if (question.type === 'open') {
          branchData.nodeDataArray.push({
            label: question.question,
            key: question.id,
            color: 'lightblue'
          })

          if (count < questions.length - 1) {
            branchData.linkDataArray.push({
              from: question.id,
              to: questions[count + 1].id
            })
          }
        } else if (question.type === 'mcq') {
          let tempAnswer = ''
          let index = 0
          branchData.nodeDataArray.push({
            label: question.question,
            key: question.id,
            color: 'lightblue'
          })
          for (var answer of Object.values(question.answers)) {
            if (answer.skipQuestions && answer.skipQuestions.length) {
              let tmpQuestions = questions.slice(count + 1)

              for (var tmpQuestion of tmpQuestions) {
                if (answer.skipQuestions.indexOf(tmpQuestion.id) === -1) {
                  branchData.nodeDataArray.push({
                    label: answer.value,
                    key: question.id + '.' + index,
                    color: 'lightblue'
                  })
                  branchData.linkDataArray.push({
                    from: question.id,
                    to: question.id + '.' + index
                  })
                  branchData.linkDataArray.push({
                    from: question.id + '.' + index,
                    to: tmpQuestion.id
                  })
                  index++

                  break
                }
              }
            } else {
              tempAnswer += answer.value + ', '
            }
          }
          if (index > 0) {
            branchData.nodeDataArray.push({
              label: tempAnswer,
              key: question.id + '.' + index,
              color: 'lightblue'
            })
            branchData.linkDataArray.push({
              from: question.id,
              to: question.id + '.' + index
            })
            if (count < questions.length - 1) {
              branchData.linkDataArray.push({
                from: question.id + '.' + index,
                to: questions[count + 1].id
              })
            }
          } else if (count < questions.length - 1) {
            branchData.linkDataArray.push({
              from: question.id,
              to: questions[count + 1].id
            })
          }
        }
        count++
      }
      ctx.body = { data: branchData }
    }
  },
  deleteQuestion: {
    async method (ctx) {
      const {
        data: { questionId, surveyId }
      } = ctx.request.body

      await request.post({
        uri: `${config.constants.URL}/admin/question-delete`,
        body: {
          secret: process.env.apiSecret,
          data: {
            questionId
          }
        },
        json: true
      })
      const { data, currentSurvey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      ctx.body = {
        questions: data,
        message: 'Question has been successfully deleted',
        survey: currentSurvey
      }
    }
  },
  addQuestion: {
    async method (ctx) {
      const {
        data: { question, surveyId, questionType, predefAnswers, answerType }
      } = ctx.request.body

      let predefinedAnswers = {}
      let n = 1
      if (predefAnswers && predefAnswers.length) {
        for (var answer of predefAnswers) {
          if (answer.value) {
            predefinedAnswers[n] = { value: answer.value }
            n++
          }
        }
      }

      await request.post({
        uri: `${config.constants.URL}/admin/question-create`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId,
            question,
            questionType,
            predefinedAnswers,
            answerType
          }
        },
        json: true
      })
      const { data, currentSurvey } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      ctx.body = {
        questions: data,
        message: 'Question has been succesfully added',
        survey: currentSurvey
      }
    }
  },
  setBranch: {
    async method (ctx) {
      const {
        data: { questions, predefinedAnswerId, surveyId }
      } = ctx.request.body
      let skipQuestions = []
      questions.map(question => {
        skipQuestions.push(question.value)
      })

      await request.post({
        uri: `${config.constants.URL}/admin/question-set-branch`,
        body: {
          secret: process.env.apiSecret,
          data: {
            predefinedAnswerId,
            skipQuestions
          }
        },
        json: true
      })
      const { data } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      ctx.body = {
        message: 'Branching has been successfully set',
        questions: data
      }
    }
  },
  updateQuestion: {
    async method (ctx) {
      const {
        data: {
          question,
          surveyId,
          questionId,
          questionType,
          predefAnswers,
          answerType
        }
      } = ctx.request.body

      let predefinedAnswers = {}
      let n = 1
      if (predefAnswers && predefAnswers.length) {
        for (var answer of predefAnswers) {
          if (answer.value) {
            predefinedAnswers[n] = { value: answer.value }
            n++
          }
        }
      }

      await request.post({
        uri: `${config.constants.URL}/admin/question-update`,
        body: {
          secret: process.env.apiSecret,
          data: {
            questionId,
            question,
            questionType,
            predefinedAnswers,
            answerType
          }
        },
        json: true
      })
      const { data } = await request.post({
        uri: `${config.constants.URL}/admin/survey-get-questions-obj`,
        body: {
          secret: process.env.apiSecret,
          data: {
            surveyId
          }
        },
        json: true
      })
      ctx.body = {
        questions: data,
        message: 'Question has been succesfully updated'
      }
    }
  }
})
