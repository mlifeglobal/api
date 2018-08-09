module.exports = Sequelize => ({
  attributes: {
    questionType: {
      type: Sequelize.ENUM,
      values: ['open', 'mcq', 'matrix'],
      defaultValue: 'open',
      field: 'question_type'
    },
    answerType: {
      type: Sequelize.ENUM,
      values: ['single', 'multiple'],
      defaultValue: 'single',
      field: 'answer_type'
    },
    question: {
      type: Sequelize.STRING,
      field: 'question'
    },
    predefinedAnswers: {
      type: Sequelize.JSON,
      field: 'predefined_answers'
    },
    order: {
      type: Sequelize.INTEGER,
      autoIncrement: false,
      defaultValue: 0,
      field: 'question_order'
    },
    surveyID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'survey_id',
      references: {
        model: 'surveys',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  },
  hooks: {
    beforeCreate: async question => {
      let order = await question.constructor.max('question_order', {
        where: { surveyID: question.surveyID }
      })

      if (isNaN(order)) question.order = 1
      else question.order = order + 1
    }
  },
  associations: {
    // belongsTo: 'Survey',
    belongsToMany: { model: 'Participant', through: 'participant_answers' }
  },
  indexes: [{ fields: ['survey_id'] }]
})
