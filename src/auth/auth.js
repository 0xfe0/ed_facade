const { Users } = require('../models/User')

const auth = {
    required: (req, res, next) => {
        if(req.isAuthenticated()) { 
          return next() 
        } else {
          res.status(200).json({error: {NotLoggedIn: "You are not supposed to be here!"}});
        }
    },
    none: (req, res, next) => {
      return next();
    }
  };

module.exports = auth;
