const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../../auth/auth.js');
const Users = mongoose.model('Users');

// router.use('/admin', require('./admin'));


function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}


/**
 * @api {post} /user NewUser
 * @apiName Create's New User
 * @apiPermission Users
 * @apiGroup User
 *
 * @apiParam {String} email Users email ID.
 * @apiParam {String} password Users password.
 * @apiParam {String} firstName Users first name.
 * @apiParam {String} lastName Users last name.
 * 
 * @apiSuccess User User object will be returned.
 *
 * @apiError password is required
 * @apiError email is required
 * @apiError NotLoggedIn You are not supposed to be here.
 * @apiError NotAdmin The You are not supposed to do this.
 *
 */
router.post('/', auth.required, (req, res, next) => {
  let user = {};
  user.email = req.query.email;
  user.password = req.query.password;
  user.firstName = req.query.firstName;
  user.lastName = req.query.lastName;

  if(user.password.trim().length < 8) {
    return res.status(422).json({
      errors: {
        BadPasswordLength: 'Password length should be more than 8 chars.',
      },
    });
  }

  if(!validateEmail(user.email)) {
    return res.status(422).json({
      errors: {
        BadEmail: 'Email not valid!',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  user.role = "User";

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: user }))
    .catch((err) => {
      res.status(422).json({
        errors: {
          err: err,
        },
      });
    });
});


/**
 * @api {post} /user/changePassword Change User Password
 * @apiName Change User Password
 * @apiPermission Users
 * @apiGroup User
 *
 * @apiParam {String} oldPassword Users current password.
 * @apiParam {String} newPassword Users new password.
 * 
 * @apiSuccess Password Will be changed to new password.
 *
 * @apiError password is required
 * @apiError email is required
 * @apiError BadOldPassword Old Password is Wrong
 * @apiError BadPasswordLength Password length should be more than 8 chars.
 *
 */
 router.post('/changePassword', auth.required, (req, res, next) => {
  const oldPassword = req.query.oldPassword;
  const newPassword = req.query.newPassword;

  
  if(!newPassword) {
    return res.status(422).json({
      errors: {
        newPassword: 'is required',
      },
    });
  }
  
  if(!oldPassword) {
    return res.status(422).json({
      errors: {
        oldPassword: 'is required',
      },
    });
  }



  if(newPassword.trim().length < 8) {
    return res.status(422).json({
      errors: {
        BadPasswordLength: 'Password length should be more than 8 chars.',
      },
    });
  }

  Users.findById(req.user._id, function(err, user) {
    if(!user.validatePassword(oldPassword)) {
      return res.status(422).json({
        errors: {
          BadOldPassword: 'Old Password is Wrong',
        },
      });
    } else {
      user.setPassword(newPassword);
      user.save()
      .then(() => {
        //on successful password change get other sessions off
        req.sessionStore.all((err, sessions)=>{ 
          console.log(sessions);
          sessions = sessions.filter((val) => {
            return ((val.email == req.user.email) &&  val.sid != req.sessionID);
          });
          sessions.map((val) => {
            req.sessionStore.destroy(val.sid);
          })
        });
        return res.status(200).json({
          success: "Password Changed!"
        });
      })
      .catch((err) => {
        res.status(422).json({
          errors: {
            err: err,
          },
        });
      });
    }
  }); 
});



/**
 * @api {get} /user/current CurrentUser
 * @apiName Gets current user data
 * @apiPermission Users Admins
 * @apiGroup User
 * 
 * @apiSuccess User User object will be returned.
 * 
 */
router.get('/current', auth.required, (req, res, next) => {
  return res.json({ user: req.user });
});

module.exports = router;