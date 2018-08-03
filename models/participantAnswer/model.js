module.exports = Sequelize => ({
  attributes: {
    answers: {
      type: Sequelize.JSON,
      field: 'answers'
    },
    surveyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'survey_id',
      references: {
        model: 'surveys',
        key: 'id'
      }
    },
    questionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'question_id',
      references: {
        model: 'questions',
        key: 'id'
      }
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
    createdDate: {
      type: Sequelize.DATE,
      field: 'created_date'
    }
  },
  associations: {
    belongsTo: ['Participant', 'Survey', 'Question']
  },
  indexes: [{ fields: ['participant_id', 'survey_id', 'question_id'] }],
  timestamps: true,
  createdAt: 'createdDate'
})
