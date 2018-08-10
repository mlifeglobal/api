module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface
      .createTable('participant_answers', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          field: 'id'
        },
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
      })
      .then(() =>
        queryInterface.addIndex('participant_answers', [
          'participant_id',
          'survey_id',
          'question_id'
        ])
      )
  },
  down (queryInterface) {
    return queryInterface
      .dropTable('participant_answers')
      .then(() =>
        queryInterface.removeIndex('participant_answers', [
          'participant_id',
          'survey_id',
          'question_id'
        ])
      )
  }
})
