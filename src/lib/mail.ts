import nodemailer from "nodemailer";

function subj(value: unknown): string {
  return String(value ?? "").replace(/[\r\n]+/g, " ").trim();
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Seu código de verificação - Connect Skills",
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
    console.error("Erro ao enviar email de verificação:", error);
    return false;
  }
}

export async function sendLoginCodeEmail(email: string, code: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Código de Acesso - Connect Skills",
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
    console.error("Erro ao enviar email de código de acesso:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Recuperação de Senha - Connect Skills",
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
    subject: "Código de Recuperação - Connect Skills",
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

export async function sendParentalConsentEmail(
  email: string,
  candidateName: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Aviso de Cadastro de Menor - Connect Skills",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Aviso de Cadastro</h2>
                <p style="text-align: center; color: #555;">Olá,</p>
                <p style="text-align: center; color: #555;">
                    Informamos que o menor <strong>${esc(candidateName)}</strong> iniciou o processo de cadastro na plataforma <strong>Connect Skills</strong>.
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

export async function sendVideoRequestEmail(
  email: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Solicitação de Vídeo - Vaga: ${subj(vacancyTitle)} - Connect Skills`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Nova Etapa: Vídeo de Apresentação</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${esc(candidateName)}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    Parabéns! A empresa gostou do seu perfil para a vaga de <strong>${esc(vacancyTitle)}</strong> e gostaria de conhecer você melhor.
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

export async function sendFeedbackEmail(
  email: string,
  candidateName: string,
  vacancyTitle: string,
  status: "APPROVED" | "REJECTED",
  justification?: string,
) {
  const isApproved = status === "APPROVED";
  const statusText = isApproved ? "Aprovado" : "Não Selecionado";
  const color = isApproved ? "#10B981" : "#EF4444";

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Feedback da Vaga: ${subj(vacancyTitle)} - Connect Skills`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Feedback do Processo Seletivo</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${esc(candidateName)}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    A empresa enviou um feedback sobre sua candidatura para a vaga de <strong>${esc(vacancyTitle)}</strong>.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <span style="background-color: ${color}20; color: ${color}; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: bold; border: 1px solid ${color};">
                        ${statusText}
                    </span>
                </div>

                ${justification
        ? `
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                        <p style="font-weight: bold; color: #374151; margin-bottom: 5px;">Mensagem da Empresa:</p>
                        <p style="color: #4b5563; font-style: italic;">"${esc(justification).replace(/\n/g, "<br />")}"</p>
                    </div>
                `
        : ""
      }

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

export async function sendVideoReceivedEmail(
  email: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  loginLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Vídeo Recebido: ${subj(candidateName)} - Vaga: ${subj(vacancyTitle)}`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Novo Vídeo Recebido</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${esc(companyName)}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    O candidato <strong>${esc(candidateName)}</strong> enviou o vídeo de apresentação solicitado para a vaga de <strong>${esc(vacancyTitle)}</strong>.
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

export async function sendNewApplicationEmail(
  email: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Nova Candidatura: ${subj(candidateName)} - Vaga: ${subj(vacancyTitle)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Nova Candidatura Recebida</h2>
        <p style="text-align: center; color: #555;">Olá <strong>${esc(companyName)}</strong>,</p>
        <p style="text-align: center; color: #555;">
          O candidato <strong>${esc(candidateName)}</strong> acabou de aplicar para a vaga de <strong>${esc(vacancyTitle)}</strong> e completou o questionário.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vacancyLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver Candidatura
          </a>
        </div>

        <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
        <p style="text-align: center; word-break: break-all; color: #4F46E5;">${vacancyLink}</p>

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
    console.error("Erro ao enviar email de nova candidatura:", error);
    return false;
  }
}

export async function sendVideoExpiredCandidateEmail(
  email: string,
  candidateName: string,
  vacancyTitle: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Prazo Encerrado: Vídeo - Vaga: ${subj(vacancyTitle)}`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #EF4444; text-align: center;">Prazo do Vídeo Encerrado</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${esc(candidateName)}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    O prazo estipulado para envio do vídeo de apresentação para a vaga de <strong>${esc(vacancyTitle)}</strong> chegou ao fim.
                </p>
                <p style="text-align: center; color: #555;">
                    Para manter a organização e agilidade do processo seletivo, o seu link de gravação/envio não está mais disponível.
                </p>
                <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
                    Desejamos sucesso nas suas próximas candidaturas.
                </p>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de video expired (candidate):", error);
    return false;
  }
}

export async function sendVideoExpiredCompanyEmail(
  email: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  platformLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Prazo Encerrado: Vídeo de ${subj(candidateName)} - Vaga: ${subj(vacancyTitle)}`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #F59E0B; text-align: center;">Aviso: Prazo de Vídeo Encerrado</h2>
                <p style="text-align: center; color: #555;">Olá <strong>${esc(companyName)}</strong>,</p>
                <p style="text-align: center; color: #555;">
                    O candidato <strong>${esc(candidateName)}</strong> não enviou o vídeo de apresentação dentro do prazo estipulado para a vaga de <strong>${esc(vacancyTitle)}</strong>.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${platformLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Acessar a Plataforma
                    </a>
                </div>

                <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
                    Você pode acessar o Ranking da vaga para tomar sua decisão quanto a esta candidatura.
                </p>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de video expired (company):", error);
    return false;
  }
}

export async function sendInterviewScheduledEmail(
  candidateEmail: string,
  candidateName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  endTime: string,
  confirmLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: candidateEmail,
    subject: `Entrevista Agendada com Mentor - Vaga: ${subj(vacancyTitle)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Entrevista com Mentor Agendada!</h2>
        <p style="text-align: center; color: #555;">Olá <strong>${esc(candidateName)}</strong>,</p>
        <p style="text-align: center; color: #555;">
          A empresa agendou uma entrevista com um de nossos mentores para a vaga de <strong>${esc(vacancyTitle)}</strong>.
        </p>
        <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${date}</p>
          <p style="margin: 8px 0 0; font-size: 16px; color: #4b5563;">${startTime} – ${endTime}</p>
        </div>
        <p style="text-align: center; color: #555;">Por favor, confirme sua presença clicando no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmLink}" style="background-color: #10B981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Confirmar Presença
          </a>
        </div>
        <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
        <p style="text-align: center; word-break: break-all; color: #4F46E5;">${confirmLink}</p>
        <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
          O mentor só será notificado após você confirmar sua presença.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de entrevista agendada:", error);
    return false;
  }
}

export async function sendOnsiteInterviewScheduledEmail(
  candidateEmail: string,
  candidateName: string,
  companyName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  confirmLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: candidateEmail,
    subject: `Convite para Entrevista Presencial - Vaga: ${subj(vacancyTitle)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Entrevista Presencial Agendada!</h2>
        <p style="text-align: center; color: #555;">Olá <strong>${esc(candidateName)}</strong>,</p>
        <p style="text-align: center; color: #555;">
          A empresa <strong>${esc(companyName)}</strong> convocou você para uma entrevista presencial para a vaga de <strong>${esc(vacancyTitle)}</strong>.
        </p>
        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${date}</p>
          <p style="margin: 8px 0 0; font-size: 16px; color: #4b5563;">${startTime}</p>
        </div>
        <p style="text-align: center; color: #555;">Por favor, confirme ou recuse sua presença clicando no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmLink}" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Acessar Convite
          </a>
        </div>
        <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
        <p style="text-align: center; word-break: break-all; color: #4f46e5;">${confirmLink}</p>
        <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
          A empresa aguarda a sua confirmação.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de entrevista presencial:", error);
    return false;
  }
}


export async function sendInterviewConfirmedToMentorEmail(
  mentorEmail: string,
  mentorName: string,
  candidateName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  endTime: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: mentorEmail,
    subject: `Entrevista Confirmada - ${subj(candidateName)} | ${subj(vacancyTitle)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Entrevista Confirmada!</h2>
        <p style="text-align: center; color: #555;">Olá <strong>${esc(mentorName)}</strong>,</p>
        <p style="text-align: center; color: #555;">
          Um candidato confirmou presença na entrevista para a vaga de <strong>${esc(vacancyTitle)}</strong>.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${date}</p>
          <p style="margin: 8px 0 0; font-size: 16px; color: #4b5563;">${startTime} – ${endTime}</p>
          <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Candidato: ${esc(candidateName)}</p>
        </div>
        <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
          Acesse a plataforma Connect Skills para mais detalhes.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email para mentor:", error);
    return false;
  }
}

export async function sendInterviewConfirmedToCompanyEmail(
  companyEmail: string,
  companyName: string,
  candidateName: string,
  mentorName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  endTime: string,
  vacancyLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: companyEmail,
    subject: `Mentoria Confirmada: ${subj(candidateName)} – Vaga: ${subj(vacancyTitle)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #10B981; text-align: center;">Mentoria Confirmada!</h2>
        <p style="text-align: center; color: #555;">Olá <strong>${esc(companyName)}</strong>,</p>
        <p style="text-align: center; color: #555;">
          A mentoria do candidato <strong>${esc(candidateName)}</strong> com o mentor <strong>${esc(mentorName)}</strong>
          para a vaga de <strong>${esc(vacancyTitle)}</strong> foi confirmada.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${date}</p>
          <p style="margin: 8px 0 0; font-size: 16px; color: #4b5563;">${startTime} – ${endTime}</p>
          <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Mentor: ${esc(mentorName)}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vacancyLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver Vaga no Painel
          </a>
        </div>
        <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
          Acesse o Connect Skills para acompanhar o processo seletivo.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de mentoria confirmada (empresa):", error);
    return false;
  }
}

export async function sendInterviewExpiredToCompanyEmail(
  companyEmail: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: companyEmail,
    subject: `Convite de Mentoria Expirado: ${subj(candidateName)} – Vaga: ${subj(vacancyTitle)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #F59E0B; text-align: center;">Convite de Mentoria Expirado</h2>
        <p style="text-align: center; color: #555;">Olá <strong>${esc(companyName)}</strong>,</p>
        <p style="text-align: center; color: #555;">
          O candidato <strong>${esc(candidateName)}</strong> não respondeu ao convite de mentoria para a vaga de <strong>${esc(vacancyTitle)}</strong> dentro do prazo de 3 dias.
        </p>
        <p style="text-align: center; color: #555;">
          O convite foi automaticamente marcado como <strong style="color: #EF4444;">Expirado</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vacancyLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver Vaga no Painel
          </a>
        </div>
        <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
          Você pode agendar uma nova sessão de mentoria para este candidato, se desejar.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de mentoria expirada (empresa):", error);
    return false;
  }
}

export async function sendMentorFeedbackToCompanyEmail(
  companyEmail: string,
  companyName: string,
  candidateName: string,
  mentorName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: companyEmail,
    subject: `Relatório de Mentoria Disponível: ${subj(candidateName)} – Vaga: ${subj(vacancyTitle)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Relatório da Entrevista Disponível</h2>
        <p style="text-align: center; color: #555;">Olá <strong>${esc(companyName)}</strong>,</p>
        <p style="text-align: center; color: #555;">
          O mentor <strong>${esc(mentorName)}</strong> acabou de enviar o relatório da entrevista com o candidato <strong>${esc(candidateName)}</strong> para a vaga de <strong>${esc(vacancyTitle)}</strong>.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vacancyLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver Relatório no Ranking
          </a>
        </div>

        <p style="text-align: center; color: #555;">ou copie o link abaixo:</p>
        <p style="text-align: center; word-break: break-all; color: #4F46E5;">${vacancyLink}</p>

        <p style="text-align: center; font-size: 14px; color: #666; margin-top: 30px;">
          Acesse a plataforma para tomar sua decisão quanto a este candidato.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de feedback do mentor para a empresa:", error);
    return false;
  }
}

export async function sendContactEmail(
  fullName: string,
  userType: string,
  subject: string,
  message: string
) {
  const adminEmail = "connect0skills@gmail.com";
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `[Contato - ${subj(userType)}] ${subj(subject)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Nova Mensagem de Contato</h2>
        
        <p><strong>Nome:</strong> ${esc(fullName)}</p>
        <p><strong>Tipo de Usuário:</strong> ${esc(userType)}</p>
        <p><strong>Assunto:</strong> ${esc(subject)}</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 20px;">
            <p style="font-weight: bold; color: #374151; margin-bottom: 5px;">Mensagem:</p>
            <p style="color: #4b5563; font-style: italic; white-space: pre-wrap;">${esc(message)}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de contato:", error);
    return false;
  }
}
