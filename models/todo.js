module.exports = (sequelize, DataTypes) => {
  return sequelize.define('todo', {
    description: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: false,
      validate: {
        len: [1, 250]
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  })
}
