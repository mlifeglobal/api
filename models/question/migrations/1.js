module.exports = Sequelize => ({
  up(queryInterface) {
    return queryInterface
      .createTable('questions', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          field: 'id'
        },
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
        predefindAnswers: {
          type: Sequelize.JSON,
          field: 'predefined_answers'
        },
        question: {
          type: Sequelize.STRING,
          field: 'question'
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
      })
      .then(() => queryInterface.addIndex('questions', ['survey_id']))
  },
  down(queryInterface) {
    return queryInterface
      .dropTable('questions')
      .then(() => queryInterface.removeIndex('questions', ['survey_id']))
  }
})
