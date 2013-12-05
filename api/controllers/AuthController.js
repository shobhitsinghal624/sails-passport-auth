/**
 * AuthController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var passport = require('passport');

module.exports = {
    
  /* e.g.
  sayHello: function (req, res) {
    res.send('hello world!');
  }
  */
    
  index: function (req, res) {
    res.view();
  },

  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },

  login: function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if(err) return next(err);
      if(!user) {
        //req.flash('error', info.message);
        return res.redirect('/login');
      }
      req.logIn(user, function (err) {
        if(err) return next(err);
        return res.redirect('/');
      });
    })(req, res, next);
  },

  signup: function(req, res, next) {
    values = _.pick(req.params.all(), 'firstname', 'lastname', 'email', 'confirmemail', 'password', 'confirmpassword', '_csrf');
    if(!values.email || values.email != values.confirmemail) {
      return res.redirect('/login');
    }
    if(!values.password || values.password != values.confirmpassword) {
      return res.redirect('/login');
    }
    User.findOneByEmail(values.email).done(function(err, user) {
      if(err) return next(err);
      if(user) {
        //User exists. Cannot create another with same email id.
        //req.flash('error', 'email id already registered.'); //Please add your own flash error or feel free to change the callback completely.
        return res.redirect('/login');
      }
      User.create({
        email: values.email,
        displayName: values.firstname + ' ' + values.lastname,
        firstName: values.firstname,
        lastName: values.lastname,
        password: values.password,
        provider: 'local',
      }).done(function(err, user) {
        req.logIn(user, function(err) {
          if(err) return next(err);
          return res.redirect('/');
        });
      });
    });

  },

  facebook: function (req, res, next) {
     passport.authenticate('facebook', {scope: ['email', 'user_about_me', 'user_birthday', 'user_location']}, function(err, user, info) {
      if(err) return next(err);
      if(!user) {
        //req.flash('error', info.message);
        return res.redirect('/login');
      }
      req.logIn(user, function (err) {
        if(err) return next(err);
        return res.redirect('/');
      });
    })(req, res, next);
  },

  'facebook/callback': function (req, res, next) {
    passport.authenticate('facebook', function(err, user, info) {
      if(err) return next(err);
      if(!user) {
        //req.flash('error', info.message);
        return res.redirect('/login');
      }
      req.logIn(user, function (err) {
        if(err) return next(err);
        return res.redirect('/');
      });
    })(req, res, next);
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}

  
};
