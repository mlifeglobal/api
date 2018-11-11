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
    platforms: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
      field: 'platforms'
    },
    order: {
      type: Sequelize.INTEGER,
      autoIncrement: false,
      defaultValue: 0,
      field: 'question_order'
    },
    surveyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'survey_id',
      references: {
        model: 'surveys',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    demographicsKey: {
      type: Sequelize.STRING,
      field: 'demographics_key'
    },
    attachmentKey: {
      type: Sequelize.STRING,
      field: 'attachment_key'
    },
    hasAttachment: {
      type: Sequelize.BOOLEAN,
      field: 'has_attachment'
    }
  },
  hooks: {
    beforeCreate: async question => {
      let order = await question.constructor.max('question_order', {
        where: { surveyId: question.surveyId }
      })

      if (isNaN(order)) question.order = 1
      else question.order = order + 1
    }
  },
  associations: {
    // belongsTo: 'Survey',
    hasMany: 'PredefinedAnswer',
    belongsToMany: { model: 'Participant', through: 'participant_answers' }
  },
  indexes: [{ fields: ['survey_id'] }]
})
