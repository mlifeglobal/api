module.exports = (
  Sequelize,
  config,
  csv,
  Survey,
  request,
  asyncBusboy,
  Bluebird
) => ({
  surveyCsv: {
    async method (ctx) {
      const { files, fields } = await asyncBusboy(ctx.req)

      // Authorization check
      if (!fields.secret || fields.secret !== process.env.apiSecret) {
        return Bluebird.reject({ status: 401, errors: 'unauthorized' })
      }

      // Read and create surveys
      let jsonObj = await csv().fromFile(files[0].path)
      let createdIds = []
      for (var survey of jsonObj) {
        // Convert strings into arrays
        if (survey.optInCodes) survey.optInCodes = survey.optInCodes.split(',')
        if (survey.initCodes) survey.initCodes = survey.initCodes.split(',')
        if (survey.platforms) survey.platforms = survey.platforms.split(',')

        var newSurvey = await Survey.create(survey)
        createdIds.push(newSurvey.id)
      }
      ctx.body = { data: createdIds }
    }
  },
  questionCsv: {
    async method (ctx) {
      const { files, fields } = await asyncBusboy(ctx.req)

      // Authorization check
      if (!fields.secret || fields.secret !== process.env.apiSecret) {
        return Bluebird.reject({ status: 401, errors: 'unauthorized' })
      }

      let jsonObj = await csv().fromFile(files[0].path)

      for (var question of jsonObj) {
        // Question validation
        if (
          !(
            ['single', 'multiple'].includes(question.answerType) &&
            ['open', 'mcq', 'matrix'].includes(question.questionType)
          )
        ) {
          return Bluebird.reject({
            status: 401,
            errors:
              'QuestionType must be one of [open, mcq, matrix], AnswerType must be one of [single, multiple] '
          })
        }
        // Convert predefined_answer into json
        if (question.predefinedAnswers) {
          let options = question.predefinedAnswers.split('\n')
          let answersObj = {}
          for (var option of options) {
            let tempOption = option.split(':')
            if (tempOption.length === 2) {
              answersObj[tempOption[0]] = { value: tempOption[1] }
            } else {
              answersObj[tempOption[0]] = {
                value: tempOption[1],
                skipQuestions: tempOption[2].split(',')
              }
            }
          }
          question.predefinedAnswers = answersObj
        } else {
          delete question['predefinedAnswers']
        }
        question.surveyId = +question.surveyId

        await request.post({
          uri: `${config.constants.URL}/admin/question-create`,
          body: {
            secret: process.env.apiSecret,
            data: question
          },
          json: true
        })
      }

      ctx.body = { data: 'Questions has been successfully created' }
    }
  }
})
