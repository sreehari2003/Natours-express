const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userDATA = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name']
  },
  email: {
    lowercase: true,
    validate: [validator.isEmail, 'please provide an email '],
    unique: true,
    type: String,
    required: [true, 'please tell us your email address']
  },
  photo: String,
  password: {
    required: [true, 'please tell us your password'],
    minLength: 8,
    type: String,
    select: false
  },
  passwordConfirm: {
    type: String,
    minlength: 8,
    required: [true, 'please confirm your password'],
    validate: {
      //only works in create and save
      //validator is the packahe
      validator: function(el) {
        return el === this.password;
      },
      message: 'password are not same'
    }
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passWordChangedAt: Date,
  passWordResetToken: String,
  passWordResetExpired: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

//ENcrypting the password
//Need to learn this keyword
userDATA.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});
//regex
userDATA.pre(/^find/, function(next) {
  //ne = not equal
  this.find({ active: { $ne: false } });
  next();
});
//comparing the password
//userpass = hash
userDATA.methods.correctPassword = async function(candPass, userPAss) {
  return await bcrypt.compare(candPass, userPAss);
};
userDATA.methods.changedPassword = function(jwtTime) {
  if (this.passWordChangedAt) {
    const changeTime = parseInt(this.passWordChangedAt.getTime() / 1000, 10);

    return changeTime > jwtTime;
  }

  //not changed
  return false;
};

userDATA.methods.createPasswordResetToken = async function() {
  //going to send this on email
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passWordResetToken = await bcrypt.hash(resetToken, 5);

  this.passWordResetExpired = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userDATA);

module.exports = User;
