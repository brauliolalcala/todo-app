const bcrypt = require('bcrypt-nodejs');
const _ = require('underscore');

module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function(value) {
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    hooks: {
      beforeValidate: (user, options) => {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    }
  })

  // Class Methods
  user.authenticate = function(body) {

    return new Promise(function(resolve, reject) {
      if (typeof body.email !== 'string' || typeof body.password !== 'string') {
        return reject();
      }

      user.findOne({
        where: {
          email: body.email
        }
      }).then((user) => {
        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
          return reject();
        }
        return resolve(user);
      }).catch((e) => res.status(500).send());

    });

  }

  // Instance Methods

  user.prototype.toPublicJSON = function() {
    var json = this.toJSON();
    return _.pick(json, 'id', 'email', 'username', 'createdAt', 'updatedAt');
  }

  return user;
}
