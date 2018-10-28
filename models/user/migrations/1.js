module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface
      .createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING
        },
        firstName: {
          type: Sequelize.STRING,
          field: 'first_name'
        },
        lastName: {
          type: Sequelize.STRING,
          field: 'last_name'
        },
        clientID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'client_id',
          references: {
            model: 'clients',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        isVerified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'is_verified'
        },
        restorePasswordToken: {
          type: Sequelize.STRING,
          field: 'restore_password_token'
        },
        restorePasswordTokenExpiresAt: {
          type: Sequelize.DATE,
          field: 'restore_password_token_expires_at'
        },
        createdAt: {
          type: Sequelize.DATE,
          field: 'created_at'
        }
      })
      .then(() => queryInterface.addIndex('users', ['client_id']))
  },
  down (queryInterface) {
    return queryInterface
      .dropTable('users')
      .then(() => queryInterface.removeIndex('users', ['client_id']))
  }
})
