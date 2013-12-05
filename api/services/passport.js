var passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcrypt');

var localVerifyHandler = function (email, password, done) {
  process.nextTick(function () {
    User.findOneByEmail(email).done(function(err, user) {
      if(err) return done(err);
      if(!user) return done(null, false);
      user.verifyPassword(password, function(err, res) {
        if(!res) return done(null, false);
        done(null, user);
      });
    });
  });
}

var facebookVerifyHandler = function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    var dob = new Date(profile._json.birthday.replace(/(\d{2})\/(\d{2})\/(\d{4})/,'$3-$1-$2'));
    User.upsert({
      email: profile._json.email,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      middleName: profile.name.middleName,
      gender: profile.gender,
      dob: dob,
      bio: profile._json.bio,
      provider: profile.provider,
      facebookDetails: {
        accessToken: accessToken,
        id: profile.id,
        username: profile.username,
        profileUrl: profile.profileUrl,
      },
    }, function(err, user) {
      return done(err, user);
    });
  });
};

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (userId, done) {
  User.findOne(userId).done(function (err, user) {
    done(err, user)
  });
});

passport.use(new FacebookStrategy({
  clientID: "549433521808021",
  clientSecret: "b48ba36723ebf7fe270488a7441c376b",
  callbackURL: "http://localhost:1337/auth/facebook/callback",
}, facebookVerifyHandler));

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, localVerifyHandler));
