module.exports = Sequelize => ({
  attributes: {
    answerKey: {
      type: Sequelize.STRING,
      field: 'answer_key',
      allowNull: false
    },
    answerValue: {
      type: Sequelize.STRING,
      field: 'answer_value',
      allowNull: false
    },
    skipQuestions: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      field: 'skip_questions',
      defaultValue: []
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
    }
  },
  associations: {},
  indexes: [{ fields: ['question_id'] }]
})
