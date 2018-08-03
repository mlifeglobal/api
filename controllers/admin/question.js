module.exports = (Sequelize, Bluebird, Survey, Question) => ({

    add: {
        schema: [
            'data',
            true,
            [['questionType', true], ['answerType', true], ['surveyID', true, 'integer']
            ['predefindAnswers', true, 'json']]
        ],
        async method(ctx) {
            const {
                data: { questionType, answerType, surveyID, predefindAnswers }
            } = ctx.request.body

            const survey = await Survey.findOne({ where: { id: surveyID } })
            if (!survey) {
                return Bluebird.reject([
                    { key: 'survey', value: `Survey not found for ID: ${surveyID}` }
                ])
            }

            const question = await Question.create({ questionType, answerType, surveyID, predefindAnswers })
            ctx.body = { data: { questionId: question.id } }
        }
    }
})