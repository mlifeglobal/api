module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('participants', 'web_linked', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  }
})
