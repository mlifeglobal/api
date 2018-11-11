module.exports = (
  Sequelize,
  config,
  csv,
  Survey,
  request,
  asyncBusboy,
  Bluebird,
  fs,
  s3
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
  },
  json: {
    async method (ctx) {
      const { files, fields } = await asyncBusboy(ctx.req)

      // Authorization check
      if (!fields.secret || fields.secret !== process.env.apiSecret) {
        return Bluebird.reject({ status: 401, errors: 'unauthorized' })
      }
      var obj = require(files[0].path)

      // Bulk survey, questions creation
      for (var survey of obj) {
        let questionsObj = {}
        if (survey.questions) {
          questionsObj = survey.questions
          delete survey.questions
        }
        var newSurvey = await Survey.create(survey)
        for (var question of questionsObj) {
          question.surveyId = newSurvey.id
          await request.post({
            uri: `${config.constants.URL}/admin/question-create`,
            body: {
              secret: process.env.apiSecret,
              data: question
            },
            json: true
          })
        }
      }
      ctx.body = { data: obj }
    }
  },

  attachment: {
    async method (ctx) {
      const {
        files,
        fields: { secret, text, surveyId }
      } = await asyncBusboy(ctx.req)

      // Authorization check
      if (!secret || secret !== process.env.apiSecret) {
        return Bluebird.reject({ status: 401, errors: 'unauthorized' })
      }
      if (!surveyId) {
        return Bluebird.reject({
          status: 200,
          errors: 'survey id has not been provided'
        })
      }

      var file = files[0]
      console.log(file.mimeType)
      var params = {
        Bucket: process.env.s3BucketName,
        Body: file,
        Key: file.filename,
        ContentType: file.mimeType
      }
      const response = await s3.upload(params).promise()

      if (response.Location) {
        const question = await request.post({
          uri: `${config.constants.URL}/admin/question-create`,
          body: {
            secret: process.env.apiSecret,
            data: {
              hasAttachment: true,
              attachmentKey: response.Location,
              question: text,
              surveyId: parseInt(surveyId)
            }
          },
          json: true
        })
        console.log(question)
      }
      ctx.body = { url: response.Location, key: file.filename }
    }
  },

  getObject: {
    async method (ctx) {
      var params = {
        Bucket: process.env.s3BucketName,
        Key: 'IMG_4181.JPG'
      }

      const payload = await s3.getObject(params).promise()
      console.log(payload.Body)
    }
  }
})
