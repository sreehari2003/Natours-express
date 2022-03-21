const User = require('../../models/userModal');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/appError');
const { promisify } = require('util');
const catchAsync = require('../../utils/wrapAsync');
const sendEmail = require('../../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
//function to create the jwt token
const createToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  //custom function to create token
  const token = createToken(newUser._id);
  newUser.password = undefined;

  res.status(200).json({
    ok: true,
    token,
    data: {
      user: newUser
    }
  });
});
//login function

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) check email and password exist ?
  if (!email || !password) {
    //400 is bad request error
    next(new AppError('please provide email and password', 400));
  }
  //2)check user exist ? and password is correct ?
  let user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError('please provide a valid email or password', 401));
    //401  = unauthorized
  }

  const token = createToken(user._id);

  res.status(201).json({
    ok: true,
    token
  });
});

//middleware for protected routing methods

exports.protect = catchAsync(async (req, res, next) => {
  //1)get the token and check if its there  ?
  let token;
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new AppError('user not logged in ', 401));
  }

  //2)verify the token !

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3)check user exist ?

  //jwt . promisify return the id of user so

  const checkUser = await User.findById(decoded.id);

  if (!checkUser) {
    return next(new AppError('user does not exist', 401));
  }
  //4)if user change after password was issued ?
  //5)
  if (checkUser.changedPassword(decoded.iat)) {
    return next(
      new AppError('user recently changed password please login again', 401)
    );
  }

  //grant access to protected route
  req.user = checkUser;
  next();
});

// restricting the user to delete the user account

exports.restrictTo = (...roles) => {
  //roles is a array eg = ["Adimin","Guide","etc"]
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('user does not have permission to delete', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const use = await User.findOne({ email: req.body.email });
  if (!use) {
    return next(new AppError('no user exist with given email', 404));
  }
  //genrate the random token

  const resetToken = await use.createPasswordResetToken();

  //prevent modal from run validation
  await use.save({ validateBeforeSave: false });

  const resetURl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Hello there user we understand that you forget your password and now want to chnage it,please send an patch request to \n ${resetURl} \n and you are ready to go`;

  try {
    await sendEmail({
      email: use.email,
      subject: 'Reset password',
      message
    });
    res.status(200).json({
      ok: true,
      message: 'mail was successfully send'
    });
  } catch {
    use.passwordResetToken = undefined;
    use.passwordResetExpires = undefined;

    await use.save({ validateBeforeSave: false });
    return next(new AppError('error sending email', 404));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const { token } = req.params;
  // const hashedToken = crypto
  //   .createHash('sha256')
  //   .update(token)
  //   .digest('hex');
  const hashedToken = await bcrypt.hash(token, 5);
  const userReset = await User.findOne({
    passWordResetToken: hashedToken
    // passwordResetExpires: { $gt: Date.now() }
  });
  console.log(userReset);
  if (!userReset) {
    return next(new AppError('user does not exist or token was expired', 404));
  }
  console.log(userReset);
  //update chnaged password
  const { password, passwordConfirm } = req.body;
  userReset.password = password;
  userReset.passwordConfirm = passwordConfirm;
  userReset.passWordResetToken = undefined;
  userReset.passwordResetExpires = undefined;
  await userReset.save();
  // sending jwt
  const tokens = createToken(userReset._id);
  res.status(200).json({
    ok: true,
    token: tokens
  });
});
