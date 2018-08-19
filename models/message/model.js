module.exports = Sequelize => ({
  attributes: {
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
  },
  timestamps: true,
  createdAt: 'createdDate',
  updatedAt: false
})
