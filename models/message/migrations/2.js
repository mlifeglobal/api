module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('messages', 'survey_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'surveys',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  }
})
