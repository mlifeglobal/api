module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('constants', 'description', {
      type: Sequelize.STRING
    })
  }
})
