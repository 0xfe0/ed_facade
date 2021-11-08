const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../../auth/auth.js');
const Users = mongoose.model('Users');


/**
 * @api {get} /ping Ping
 * @apiName Ping
 * @apiPermission None
 * @apiGroup General
 * 
 * @apiSuccess ping "its's up!"
 * 
 */
router.get('/', auth.none, (req, res, next) => {
  return res.json({ ping: "It's up!" });
});

module.exports = router;