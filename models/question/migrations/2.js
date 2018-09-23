module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('questions', 'demographics_key', {
      type: Sequelize.STRING
    })
  }
})
