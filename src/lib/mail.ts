import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
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
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">Este código expira em 30 minutos.</p>
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

export async function sendLoginCodeEmail(email: string, code: string) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Código de Acesso - Connect Skills',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Verificação de Segurança</h2>
        <p style="text-align: center; color: #555;">Detectamos um novo acesso à sua conta. Use o código abaixo para completar o login:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; border: 1px solid #e5e7eb;">
            ${code}
          </span>
        </div>

        <p style="text-align: center; font-size: 14px; color: #666;">
          Se você não solicitou este acesso, recomendamos alterar sua senha.
        </p>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">Este código expira em 30 minutos.</p>
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

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Recuperação de Senha - Connect Skills',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Recuperação de Senha</h2>
                <p style="text-align: center; color: #555;">Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Redefinir Senha
                    </a>
                </div>

                <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
                <p style="text-align: center; word-break: break-all; color: #4F46E5;">${resetLink}</p>

                <p style="text-align: center; font-size: 14px; color: #666;">
                    Se você não solicitou a redefinição, ignore este email.
                </p>
                <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">Este link expira em 1 hora.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar email de reset:", error);
        return false;
    }
}

export async function sendPasswordResetCodeEmail(email: string, code: string) {
    const resetLink = `${process.env.APP_URL}/reset-password?email=${encodeURIComponent(email)}&token=${code}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Código de Recuperação - Connect Skills',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Recuperação de Senha</h2>
                <p style="text-align: center; color: #555;">Você solicitou a redefinição de sua senha. Use o código abaixo para redefinir:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <span style="background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; border: 1px solid #e5e7eb;">
                    ${code}
                  </span>
                </div>

                <p style="text-align: center; color: #555;">Ou se preferir, clique no botão abaixo:</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Redefinir Senha
                    </a>
                </div>

                <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
                <p style="text-align: center; word-break: break-all; color: #4F46E5;">${resetLink}</p>

                <p style="text-align: center; font-size: 14px; color: #666;">
                    Se você não solicitou a redefinição, ignorar este email.
                </p>
                <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">Este link/código expira em 1 hora.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar email de reset (código):", error);
        return false;
    }
}
