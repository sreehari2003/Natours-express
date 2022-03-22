const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/Auth/authController');
const multer = require('multer');
const { protect, restrictTo } = authController;
const router = express.Router();

const upload = multer({ dest: 'public/img/users' });

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
//sending patch req to reset password
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    protect,
    restrictTo('admin', 'lead-guide'),
    userController.deleteUser
  );

module.exports = router;
