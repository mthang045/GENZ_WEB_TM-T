import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Mã xác nhận GENZ',
    text: `Mã xác nhận của bạn là: ${code}`,
  });
}
