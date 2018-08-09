module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface
      .createTable('predefined_answers', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          field: 'id'
        },
        answerKey: {
          type: Sequelize.STRING,
          field: 'answer_key'
        },
        answerValue: {
          type: Sequelize.STRING,
          field: 'answer_value'
        },
        skipQuestions: {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
          field: 'skip_questions',
          defaultValue: []
        },
        questionID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'question_id',
          references: {
            model: 'questions',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      })
      .then(() =>
        queryInterface.addIndex('predefined_answers', ['question_id'])
      )
  },
  down (queryInterface) {
    return queryInterface
      .dropTable('predefined_answers')
      .then(() =>
        queryInterface.removeIndex('predefined_answers', ['question_id'])
      )
  }
})
