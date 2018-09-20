module.exports = Sequelize => ({
  attributes: {
    requestId: {
      type: Sequelize.STRING,
      unique: true,
      field: 'request_id'
    },
    amount: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING,
      field: 'phone'
    },
    channel: {
      type: Sequelize.ENUM,
      values: ['africastalking', 'transferto'],
      defaultValue: 'africastalking'
    },
    status: {
      type: Sequelize.ENUM,
      values: ['Success', 'Failed', 'Sent'],
      defaultValue: 'Sent'
    },
    surveyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'survey_id'
    },
    createdDate: {
      type: Sequelize.DATE,
      field: 'created_date'
    },
    updatedDate: {
      type: Sequelize.DATE,
      field: 'updated_date'
    }
  },
  timestamps: true,
  createdAt: 'createdDate',
  updatedAt: 'updatedDate'
})
