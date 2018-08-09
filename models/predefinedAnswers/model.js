module.exports = Sequelize => ({
  attributes: {
    answerValue: {
      type: Sequelize.STRING,
      field: 'answer_value'
    },
    skipQuestions: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      field: 'skip_questions',
      defaultValue: []
    },
    answerKey: {
      type: Sequelize.STRING,
      field: 'answer_key'
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
  },
  indexes: [{ fields: ['question_id'] }]
})
