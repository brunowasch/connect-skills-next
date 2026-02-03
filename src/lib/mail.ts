import nodemailer from 'nodemailer';

const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
    : nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

export async function sendVerificationEmail(email: string, code: string) {

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Seu código de verificação - Connect Skills',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Bem-vindo à Connect Skills!</h2>
        <p style="text-align: center; color: #555;">Use o código abaixo para validar seu cadastro e ativar sua conta:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; border: 1px solid #e5e7eb;">
            ${code}
          </span>
        </div>

        <p style="text-align: center; font-size: 14px; color: #666;">
          Se você não solicitou este código, ignore este email.
        </p>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">Este código expira em 24 horas.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}
