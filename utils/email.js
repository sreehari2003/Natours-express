const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //create a transporter
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD
  //     }
  //     //Activate "less secure secret option"
  //   });
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '67c4786a024924',
      pass: '1f4b44a4024810'
    }
  });

  //define the email options
  const optionss = {
    from: 'sreehari jayaraj <hello@sreehari>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  //actuel send email

  //returns an promise
  await transport.sendMail(optionss);
};
module.exports = sendEmail;
