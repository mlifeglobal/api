module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.createTable('participants', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        field: 'phone'
      },
      facebookId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        field: 'facebook_id'
      },
      whatsappId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        field: 'whatsapp_id'
      }
    })
  },
  down (queryInterface) {
    return queryInterface.dropTable('participants')
  }
})
