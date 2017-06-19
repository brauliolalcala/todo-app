module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [7,100]
      }
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    }
  })
}
