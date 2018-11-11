module.exports = Sequelize => ({
  up (queryInterface) {
    return [
      queryInterface.addColumn('questions', 'attachment_key', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('questions', 'has_attachment', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ]
  }
})
