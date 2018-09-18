module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('surveys', 'max_completion_limit', {
      type: Sequelize.INTEGER
    })
  }
})
