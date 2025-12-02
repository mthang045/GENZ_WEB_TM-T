import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to, code) {
  try {
    console.log('[sendVerificationEmail] Attempting to send to:', to, 'with code:', code);
    console.log('[sendVerificationEmail] EMAIL_USER configured:', !!process.env.EMAIL_USER, 'EMAIL_PASS configured:', !!process.env.EMAIL_PASS);

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Mã xác nhận GENZ',
      html: `<p>Mã xác nhận của bạn là: <strong>${code}</strong></p><p>Mã này có hiệu lực trong 10 phút.</p>`,
    });

    console.log('[sendVerificationEmail] Email sent successfully to:', to, 'messageId:', result.messageId);
    return result;
  } catch (err) {
    console.error('[sendVerificationEmail] Failed to send email to:', to, 'error:', err.message, 'code:', err.code);
    // DEV MODE: không throw, log mã ra console
    console.log('[sendVerificationEmail] DEV MODE - Code for', to, 'is:', code);
    return { messageId: 'dev-mode-' + Date.now(), code, to };
  }
}
