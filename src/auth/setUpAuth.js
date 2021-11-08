let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy;


//import the model
const { Users } = require('../models/User')

module.exports.setUpAuth = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  passport.deserializeUser( async function(userId, done) {
    try {
      let user = await Users.findById(userId);
      let res_to_return = {}
      res_to_return._id = user._id;
      res_to_return.email = user.email;
      res_to_return.firstName = user.firstName;
      res_to_return.lastName = user.lastName;
      done(null, res_to_return);
    } catch (err) {
      done(err, null)
    }
  });

  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(username, password, done) {
        Users.findOne({email: username})
        .then((res) => {
          console.log(res);
            if(!res) {
                return done("incorrent username", false);
            } else {
                if(!res.validatePassword(password)) {
                    return done("incorrent password", false);
                } else {
                  let res_to_return = {}
                  res_to_return._id = res._id;
                  res_to_return.email = res.email;
                  res_to_return.firstName = res.firstName;
                  res_to_return.lastName = res.lastName;
                  done(null, res_to_return);
                }
            }
        })
        .catch((err) => {
            return done(err, false);
        });
    }
  ));


/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Session
 *
 * @apiParam {String} email Users email ID.
 * @apiParam {String} password Users password ID. 
 *
 * @apiSuccess {String} email  Email of the User.
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "email": "email@examp.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *     }
 *
 * @apiError UserNotFound The <code>email</code> of the User was not found.
 *
 */
  app.post("/login", function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { 
        return res.status(422).json({error: err});
      }

      req.logIn(user, function(err) {

        if (err) { return next(err); }

        if (req.body.rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
          req.session.cookie.expires = false; // Cookie expires at end of session
        }

        req.session.email = user.email;
        req.session.sid = req.sessionID;

        return res.status(200).json({user: user});

      });

    })(req, res, next);
});

/**
 * @api {get} /logout Logout
 * @apiName Logout current session
 * @apiGroup Session
 *
 *
 * @apiSuccess {String} logout  Logout Success Text.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "logout": "success",
 *     }
 *
 */
  app.get('/logout', function(req, res){
    req.logout();
    res.status(200).json({logout: "success"});
  });

}