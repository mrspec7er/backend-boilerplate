import nodemailer from "nodemailer";
const emailConfig = {
  host: "mail.ittsuexpo.com",
  port: 587,
  auth: {
    user: "testing@ittsuexpo.com",
    pass: "@mrc201_",
  },
  tls: {
    rejectUnauthorized: false,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

async function sendEmail(mailOptions: any) {
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.log(err);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

export default sendEmail;
