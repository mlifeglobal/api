module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('questions', 'platforms', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    })
  }
})
