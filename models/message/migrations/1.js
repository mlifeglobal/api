module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'message'
      },
      platform: {
        type: Sequelize.ENUM,
        values: ['sms', 'facebook', 'whatsapp'],
        defaultValue: 'sms',
        field: 'platform'
      },
      direction: {
        type: Sequelize.ENUM,
        values: ['incoming', 'outgoing'],
        defaultValue: 'incoming',
        field: 'direction'
      },
      messageIdentifier: {
        type: Sequelize.STRING,
        field: 'message_identifier',
        allowNull: true
      },
      participantID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'participant_id',
        references: {
          model: 'participants',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdDate: {
        type: Sequelize.DATE,
        field: 'created_date'
      }
    })
  },
  down (queryInterface) {
    return queryInterface.dropTable('messages')
  }
})
