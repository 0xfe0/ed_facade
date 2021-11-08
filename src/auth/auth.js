const { Users } = require('../models/User')

const auth = {
    required: (req, res, next) => {
        if(req.isAuthenticated()) { 
          return next() 
        } else {
          res.status(200).json({error: {NotLoggedIn: "You are not supposed to be here!"}});
        }
    },
    onlyAdmin: (req, res, next) => {
        if(req.isAuthenticated()) { 
            Users.findById(req.user._id)
            .then((res) => {
                if(res.role === "Admin") {
                    return next();
                } else {
                    res.status(200).json({error: {NotAdmin: "You are not supposed to do this!"}});
                }
            })
            .catch((err) => {
                res.status(401).json({error: "Something bad happened"});
            })
          } else {
            res.status(200).json({error: {NotLoggedIn: "You are not supposed to be here!"}});
          }
    }
  };

module.exports = auth;
