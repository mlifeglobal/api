module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface
      .createTable('participant_surveys', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          field: 'id'
        },
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
        surveyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'survey_id',
          references: {
            model: 'surveys',
            key: 'id'
          }
        }
      })
      .then(() => queryInterface.addIndex('participant_surveys', ['participant_id', 'survey_id']))
  },
  down (queryInterface) {
    return queryInterface
      .dropTable('participant_surveys')
      .then(() => queryInterface.removeIndex('participant_surveys', ['participant_id', 'survey_id']))
  }
})
