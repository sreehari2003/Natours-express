const catchAsync = require('../utils/wrapAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModal');

const filterObj = (body, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (fields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
};

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //create error if user post password data
  const { password, passwordConfirm } = req.body;
  if (password || passwordConfirm) {
    return next(new AppError('This route is not for password update', 400));
  }
  const x = filterObj(req.body, 'email', 'name');
  await User.findByIdAndUpdate(req.user.id, x, {
    new: true,
    runValidators: true
  });
  res.status(201).json({
    ok: true,
    message: 'name was updated successfully'
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findById(req.user.id, { active: false });

  res.status(204).json({
    ok: true,
    message: 'account was deleted'
  });
});
