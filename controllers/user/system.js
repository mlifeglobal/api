module.exports = (Survey, Participant, ParticipantAnswer, Message) => ({
  fetch: {
    async method (ctx) {
      const surveys = await Survey.count()
      const participants = await Participant.count()
      const messages = await Message.count()
      const dataPoints = await ParticipantAnswer.count()

      ctx.body = {
        data: {
          surveys: surveys,
          participants: participants,
          dataPoints: dataPoints,
          messages: messages
        }
      }
    }
  }
})
