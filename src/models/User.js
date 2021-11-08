const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      lowercase: true,
},
  firstName: {
      type: String,
      trim: true
},
  lastName: {
    type: String,
    trim: true
},
  passwordHash: String,
  passwordSalt: String,
});

UsersSchema.methods.setPassword = function(password) {
  this.passwordSalt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
  const passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 10000, 512, 'sha512').toString('hex');
  return this.passwordHash === passwordHash;
};

let Users = mongoose.model('Users', UsersSchema);

module.exports = { UsersSchema, Users }
