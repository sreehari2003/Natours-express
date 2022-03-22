const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARES

//limit the request from a single ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this ip adress so please try again later'
});

// /api beacuse of api routes
app.use('/api', limiter);

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
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//MIDDLEWARES ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError(`cant find the ${req.originalUrl} on this server`, 404));
});
//error handling middleware
app.use(globalErrorHandler);

module.exports = app;
