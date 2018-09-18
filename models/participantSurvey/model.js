module.exports = Sequelize => ({
  attributes: {
    status: {
      type: Sequelize.ENUM,
      values: ['intro', 'initiated', 'in_progress', 'completed'],
      defaultValue: 'intro',
      field: 'status'
    },
    lastAnsweredQuestionId: {
      type: Sequelize.INTEGER,
      field: 'last_answered_question_id'
    },
    skippedQuestions: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      field: 'skipped_questions',
      defaultValue: []
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
    participantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'participant_id',
      references: {
        model: 'participants',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  },
  indexes: [{ fields: ['participant_id', 'survey_id'] }]
})
