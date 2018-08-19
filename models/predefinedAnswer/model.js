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
    displayOrder: {
      type: Sequelize.INTEGER,
      autoIncrement: false,
      defaultValue: 0,
      field: 'display_order'
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
  hooks: {
    beforeCreate: async answer => {
      let displayOrder = await answer.constructor.max('display_order', {
        where: { questionId: answer.questionId }
      })

      if (isNaN(displayOrder)) answer.displayOrder = 1
      else answer.displayOrder = displayOrder + 1
    }
  },
  indexes: [{ fields: ['question_id'] }]
})
