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
    predefindAnswers: {
      type: Sequelize.JSON,
      field: 'predefined_answers'
    },
    order: {
      type: Sequelize.INTEGER,
      autoIncrement: false,
      field: 'order'
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
  associations: {
    belongsTo: 'Survey',
    hasMany: ['ParticipantAnswer']
  },
  indexes: [{ fields: ['survey_id'] }]
})
