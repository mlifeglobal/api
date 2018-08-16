module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('surveys', 'init_codes', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: ['1']
    })
  }
})
