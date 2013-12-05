/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

  attributes: {

    email: {
      type: 'email',
      unique: true,
      required: true,
    },

    encryptedPassword: {
      type: 'string'
    },

    displayName: {
      type: 'string',
    },

    firstName: {
      type: 'string',
    },
 
    lastName: {
      type: 'string',
    },

    middleName: {
      type: 'string',
    },

    gender: {
      type: 'string',
    },

    isAdmin: {
      type: 'boolean',
      defaultsTo: false
    },

    dob: {
      type: 'date',
    },
    
    bio: {
      type: 'text',
    },
    
    provider: {
      type: 'string',
    },

    facebookDetails: {
      type: 'json',
    },

    verifyPassword: function(password, cb) {
      var ePwd = this.encryptedPassword;
      if(!ePwd) return cb(null, false);
      require('bcrypt').compare(password, ePwd, cb);
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.encryptedPassword;
      return obj;
    }
  },

  beforeCreate: function(values, next) {
    if(_.has(values, 'encryptedPassword')) {delete values.encryptedPassword;}
    if(!_.has(values, 'password')) return next();
    require('bcrypt').hash(values.password, 10, function(err, encryptedPassword) {
      if(err) return next(err);
      values.encryptedPassword = encryptedPassword;
      delete values.password;
      next();
    });
  },

  upsert: function(values, cb) {
    if(!_.has(values, 'email')) return next('Please provide and email id.');
    User.findOneByEmail(values.email).done(function(err, user) {
      if(err) return cb(err);
      if(!user) {
        User.create(_.pick(values, 'email', 'displayName', 'firstName', 'lastName', 'middleName', 'gender', 'dob', 'bio', 'provider', 'facebookDetails', 'password'), cb);
      }
      else {
        var updateQuery = _.extend(_.omit(user, 'id', 'email', 'createdAt', 'updatedAt', 'encryptedPassword', 'isAdmin'), _.pick(values, 'displayName', 'firstName', 'lastName', 'middleName', 'gender', 'dob', 'bio', 'provider', 'facebookDetails'));
        User.update(user.id, updateQuery, function(err, users) {
          if(err) return cb(err);
          cb(null, users[0]);
        });
      }
    });
  },


};
