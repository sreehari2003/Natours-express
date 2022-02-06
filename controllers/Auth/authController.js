const User = require('../../models/userModal');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/appError');
// const { promisify } = require('util');
//function to create the jwt token
const createToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });
    //custom function to create token
    const token = createToken(newUser._id);

    res.status(200).json({
      ok: true,
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    res.status(404).json({
      ok: false,
      err: err
    });
  }
};

//login function

exports.login = async (req, res, next) => {
  try {
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
  } catch (e) {
    res.status(404).json({
      ok: false,
      err: e
    });
  }
  next();
};

//middleware for protected routing methods

exports.protect = async (req, res, next) => {
  //1)get the token and check if its there  ?
  let token;
  if (req.headers && req.headers.authorization.startswith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);
  if (!token) {
    //no return added
    next(new AppError('you are not logged in', 401));
    res.redirect('/login');
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        res.redirect('/login');
      } else {
        next();
      }
    });
  }
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //2)verify the token !
  //3)check user exist ?
  //4)if user change after password was issued ?
  //5)
};

//restricting the user to delete the user account

// exports.restrictTo = (...roles)=>{
//   //roles is a array eg = ["Adimin","Guide","etc"]
//    return (req, res, next)=>{
//        if(!)
//   }
// }
