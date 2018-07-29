module.exports = (bcrypt, config, JWT, mail, moment, Sequelize, twilio, uuid, amplitude, aws) => ({
  attributes: {
    status: {
      type: Sequelize.ENUM,
      values: ['in_progress', 'completed'],
      defaultValue: 'in_progress',
      field: 'status'
    },
    lastAnsweredQuestionId: {
      type: Sequelize.INTEGER,
      field: 'last_answered_question_id'
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
  associations: {
    belongsTo: ['Participant', 'Survey']
  },
  indexes: [
    { fields: ['participant_id', 'survey_id'] }
  ]
})
