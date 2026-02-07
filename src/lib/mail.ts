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

export async function sendParentalConsentEmail(email: string, candidateName: string) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Aviso de Cadastro de Menor - Connect Skills',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Aviso de Cadastro</h2>
                <p style="text-align: center; color: #555;">Olá,</p>
                <p style="text-align: center; color: #555;">
                    Informamos que o menor <strong>${candidateName}</strong> iniciou o processo de cadastro na plataforma <strong>Connect Skills</strong>.
                </p>
                <p style="text-align: center; color: #555;">
                    Durante o cadastro, foi indicado que você é o responsável legal e que houve consentimento para o uso da plataforma.
                </p>
                
                <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
                    Se você não reconhece este cadastro ou não autorizou, por favor entre em contato conosco imediatamente.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar email de consentimento parental:", error);
        return false;
    }
}

export async function sendVideoRequestEmail(email: string, candidateName: string, vacancyTitle: string, vacancyLink: string) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Solicitação de Vídeo - Vaga: ${vacancyTitle} - Connect Skills`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Nova Etapa: Vídeo de Apresentação</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${candidateName}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    Parabéns! A empresa gostou do seu perfil para a vaga de <strong>${vacancyTitle}</strong> e gostaria de conhecer você melhor.
                </p>
                <p style="text-align: center; color: #555;">
                    Solicitamos que você grave ou envie um vídeo de apresentação de até 3 minutos.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${vacancyLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Acessar Vaga e Enviar Vídeo
                    </a>
                </div>

                <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
                <p style="text-align: center; word-break: break-all; color: #4F46E5;">${vacancyLink}</p>

                <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
                    Boa sorte!
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar email de solicitação de vídeo:", error);
        return false;
    }
}

export async function sendFeedbackEmail(email: string, candidateName: string, vacancyTitle: string, status: 'APPROVED' | 'REJECTED', justification?: string) {
    const isApproved = status === 'APPROVED';
    const statusText = isApproved ? 'Aprovado' : 'Reprovado';
    const color = isApproved ? '#10B981' : '#EF4444';

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Feedback da Vaga: ${vacancyTitle} - Connect Skills`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Feedback do Processo Seletivo</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${candidateName}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    A empresa enviou um feedback sobre sua candidatura para a vaga de <strong>${vacancyTitle}</strong>.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <span style="background-color: ${color}20; color: ${color}; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: bold; border: 1px solid ${color};">
                        ${statusText}
                    </span>
                </div>

                ${justification ? `
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                        <p style="font-weight: bold; color: #374151; margin-bottom: 5px;">Mensagem da Empresa:</p>
                        <p style="color: #4b5563; font-style: italic;">"${justification}"</p>
                    </div>
                ` : ''}

                <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
                    Obrigado por utilizar o Connect Skills!
                </p>
            </div>
        `,
    };


    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar email de feedback:", error);
        return false;
    }
}

export async function sendVideoReceivedEmail(email: string, companyName: string, candidateName: string, vacancyTitle: string, loginLink: string) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Vídeo Recebido: ${candidateName} - Vaga: ${vacancyTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Novo Vídeo Recebido</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${companyName}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    O candidato <strong>${candidateName}</strong> enviou o vídeo de apresentação solicitado para a vaga de <strong>${vacancyTitle}</strong>.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Fazer Login e Ver Vídeo
                    </a>
                </div>

                <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
                <p style="text-align: center; word-break: break-all; color: #4F46E5;">${loginLink}</p>

                <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
                    Acesse a plataforma para avaliar o candidato.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar email de vídeo recebido:", error);
        return false;
    }
}
