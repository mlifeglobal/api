module.exports = Sequelize => ({
  attributes: {
    answers: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      field: 'answers',
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
    questionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'question_id',
      references: {
        model: 'questions',
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
    },
    demographics: {
      type: Sequelize.STRING,
      field: 'demographics'
    },
    createdDate: {
      type: Sequelize.DATE,
      field: 'created_date'
    }
  },
  indexes: [{ fields: ['participant_id', 'survey_id', 'question_id'] }],
  timestamps: true,
  createdAt: 'createdDate',
  updatedAt: false
})
