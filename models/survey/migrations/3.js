module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('surveys', 'client_id', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      references: {
        model: 'clients',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  }
})
