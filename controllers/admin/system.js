module.exports = (Survey, ParticipantSurvey, ParticipantAnswer, Config) => ({
  info: {
    async method (ctx) {
      let message = '-------------------------------------\n'

      // Get Survey info
      message += 'SURVEYS INFO:\n'
      const surveys = {
        uninitiated: { count: 0, ids: [] },
        in_progress: { count: 0, ids: [] },
        completed: { count: 0, ids: [] }
      }

      const allSurveys = await Survey.findAll()
      for (const { id, state } of allSurveys) {
        surveys[state].count += 1
        surveys[state].ids.push(id)
      }

      if (surveys.uninitiated.count) {
        message += `Uninitiated surveys - count [${
          surveys.uninitiated.count
        }] - IDs [${surveys.uninitiated.ids.join()}]\n`
      }
      if (surveys.in_progress.count) {
        message += `In-progress surveys - count [${
          surveys.in_progress.count
        }] - IDs [${surveys.in_progress.ids.join()}]\n`
      }
      if (surveys.completed.count) {
        message += `Closed surveys - count [${
          surveys.completed.count
        }] - IDs [${surveys.completed.ids.join()}]\n`
      }

      // Get Participant Completion info
      message += "\nPARTICIPANTS' INTERACTION INFO:\n"
      const participants = {
        intro: 0,
        initiated: 0,
        in_progress: 0,
        completed: 0
      }

      const participantSurveys = await ParticipantSurvey.findAll()
      for (const { status } of participantSurveys) {
        participants[status] += 1
      }

      if (participants.intro) {
        message += `Intro sent - count [${participants.intro}]\n`
      }
      if (participants.initiated) {
        message += `Initiated - count [${participants.initiated}]\n`
      }
      if (participants.in_progress) {
        message += `Currently filling - count [${participants.in_progress}]\n`
      }
      if (participants.completed) {
        message += `Completed - count [${participants.completed}]\n`
      }

      // Get # of data points
      const dataPointsCount = await ParticipantAnswer.count()
      message += `\nTotal Data Points: ${dataPointsCount}`

      ctx.body = { data: { surveys, participants, dataPointsCount }, message }
    }
  },
  configUpload: {
    schema: [
      [
        'data',
        true,
        [['key', true], ['description', true], ['value', true], ['token']]
      ]
    ],
    async method (ctx) {
      const {
        data: { key, description, value, token }
      } = ctx.request.body

      await Config.create({
        key,
        description,
        value,
        token
      })

      ctx.body = {
        data: `Config has been succesfully added for: ${description}`
      }
    }
  }
})
