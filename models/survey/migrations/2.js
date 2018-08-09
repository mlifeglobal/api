module.exports = Sequelize => ({
  up (queryInterface) {
    return (
      queryInterface.addColumn('surveys', 'intro_string', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('surveys', 'completion_string', {
        type: Sequelize.STRING
      })
    )
  }
})
