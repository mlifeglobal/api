module.exports = (Sequelize, bcrypt, JWT) => ({
  attributes: {
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
  },
  instanceMethods: {
    hashPassword (password) {
      this.password = bcrypt.hashSync(password, 8)
    },
    checkPassword (password) {
      return bcrypt.compareSync(password, this.password)
    },
    generateJWT () {
      return JWT.sign({ id: this.id, email: this.email }, process.env.key)
    },
    getData () {
      return {
        jwt: this.generateJWT(),
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        clientID: this.clientID
      }
    }
  },
  associations: {
    belongsTo: 'Client'
  },
  indexes: [{ fields: ['client_id'] }],
  hooks: {
    beforeCreate (instance) {
      instance.hashPassword(instance.password)
    }
  },
  timestamps: true,
  updatedAt: false
})
