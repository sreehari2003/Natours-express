const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.get('/', (req, res) => {
  res.send('<h1 style=text-align:center>HELLO WORLD</h1>');
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//MIDDLEWARES ERROR HANDLING
app.all('*', (req, res, next) => {
  // return res.status(404).json({
  //   ok: false,
  //   result: 'invalid parameter'
  // });
  // const err = new Error(`cant't find the ${req.originalUrl} on this server`);
  // err.status = 404;
  // err.statusCode = 404;
  // next(err);
  next(new AppError(`cant fing the ${req.originalUrl} on this server`, 404));
});
//error handling middleware
app.use(globalErrorHandler);

module.exports = app;
