const bcrypt = require('bcrypt-nodejs');
const _ = require('underscore');
const cryptojs = require('crypto-js');
const jwt = require('jsonwebtoken');

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
  user.authenticate = (body) => {

    return new Promise((resolve, reject) => {
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

  user.findByToken = function (token) {
    return new Promise( (resolve, reject) =>{
      try {
        var decodedJWT = jwt.verify(token, 'secretKeyJWT');
        var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'secretKeyCRYPTO');
        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

        user.findById(tokenData.id).then( (user) => resolve(user)).catch( () => reject());
      } catch (e) {
        reject();
      }
    });

  }

  // Instance Methods

  user.prototype.toPublicJSON = function () {
    var json = this.toJSON();
    return _.pick(json, 'id', 'email', 'username', 'createdAt', 'updatedAt');
  }

  user.prototype.generateToken = function (type) {
    if (!_.isString(type)) {
      return undefined;
    }

    try {
      var stringData = JSON.stringify({id: this.get('id'), type: type});
      var encryptedData = cryptojs.AES.encrypt(stringData, 'secretKeyCRYPTO').toString();
      var token = jwt.sign({
        token: encryptedData
      }, 'secretKeyJWT');
      return token;
    } catch (e) {
      return undefined;
    }
  }

  return user;
}
