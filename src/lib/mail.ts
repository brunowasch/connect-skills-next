import nodemailer from "nodemailer";
import { renderEmail, paragraph, infoBox, codeBox, eventBox, escapeHtml } from "./email-layout";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

type BuiltEmail = { subject: string; html: string };

async function send(to: string, { subject, html }: BuiltEmail, errorLabel: string) {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    return true;
  } catch (error) {
    console.error(errorLabel, error);
    return false;
  }
}

const multiline = (text: string) => escapeHtml(text).replace(/\n/g, "<br />");

// ---------------------------------------------------------------------------
// Conta e acesso
// ---------------------------------------------------------------------------

export function buildVerificationEmail(code: string): BuiltEmail {
  return {
    subject: "Seu código de verificação - Connect Skills",
    html: renderEmail({
      preheader: `Seu código de verificação é ${code}.`,
      badge: "Verificação de conta",
      title: "Bem-vindo à Connect Skills!",
      body:
        paragraph("Use o código abaixo para validar seu cadastro e ativar sua conta:") +
        codeBox(code) +
        paragraph('<span style="font-size: 13px;">Este código expira em 30 minutos.</span>'),
      footnote: "Se você não solicitou este código, ignore este e-mail.",
    }),
  };
}

export async function sendVerificationEmail(email: string, code: string) {
  return send(email, buildVerificationEmail(code), "Erro ao enviar email de verificação:");
}

export function buildLoginCodeEmail(code: string): BuiltEmail {
  return {
    subject: "Código de Acesso - Connect Skills",
    html: renderEmail({
      preheader: `Seu código de acesso é ${code}.`,
      badge: "Verificação de segurança",
      tone: "warning",
      title: "Confirme seu acesso",
      body:
        paragraph("Detectamos um novo acesso à sua conta. Use o código abaixo para completar o login:") +
        codeBox(code) +
        paragraph('<span style="font-size: 13px;">Este código expira em 30 minutos.</span>'),
      footnote: "Se você não solicitou este acesso, recomendamos alterar sua senha.",
    }),
  };
}

export async function sendLoginCodeEmail(email: string, code: string) {
  return send(email, buildLoginCodeEmail(code), "Erro ao enviar email de código de acesso:");
}

export function buildPasswordResetEmail(token: string): BuiltEmail {
  const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

  return {
    subject: "Recuperação de Senha - Connect Skills",
    html: renderEmail({
      preheader: "Redefina a senha da sua conta Connect Skills.",
      badge: "Recuperação de senha",
      title: "Redefina sua senha",
      body:
        paragraph("Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha.") +
        paragraph('<span style="font-size: 13px;">Este link expira em 1 hora.</span>'),
      cta: { label: "Redefinir senha", url: resetLink },
      footnote: "Se você não solicitou a redefinição, ignore este e-mail. Sua senha continua a mesma.",
    }),
  };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  return send(email, buildPasswordResetEmail(token), "Erro ao enviar email de reset:");
}

export function buildPasswordResetCodeEmail(email: string, code: string): BuiltEmail {
  const resetLink = `${process.env.APP_URL}/reset-password?email=${encodeURIComponent(email)}&token=${code}`;

  return {
    subject: "Código de Recuperação - Connect Skills",
    html: renderEmail({
      preheader: `Seu código de recuperação é ${code}.`,
      badge: "Recuperação de senha",
      title: "Redefina sua senha",
      body:
        paragraph("Você solicitou a redefinição da sua senha. Use o código abaixo para redefinir:") +
        codeBox(code) +
        paragraph("Ou, se preferir, clique no botão abaixo:"),
      cta: { label: "Redefinir senha", url: resetLink },
      footnote: "Este link e o código expiram em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.",
    }),
  };
}

export async function sendPasswordResetCodeEmail(email: string, code: string) {
  return send(email, buildPasswordResetCodeEmail(email, code), "Erro ao enviar email de reset (código):");
}

export function buildParentalConsentEmail(candidateName: string): BuiltEmail {
  return {
    subject: "Aviso de Cadastro de Menor - Connect Skills",
    html: renderEmail({
      preheader: `${candidateName} iniciou um cadastro na Connect Skills indicando você como responsável legal.`,
      badge: "Aviso de cadastro",
      tone: "warning",
      title: "Cadastro de menor na Connect Skills",
      greeting: "Olá",
      body:
        paragraph(`Informamos que o menor <strong>${escapeHtml(candidateName)}</strong> iniciou o processo de cadastro na plataforma <strong>Connect Skills</strong>.`) +
        paragraph("Durante o cadastro, foi indicado que você é o responsável legal e que houve consentimento para o uso da plataforma."),
      footnote: "Se você não reconhece este cadastro ou não o autorizou, entre em contato conosco imediatamente.",
      recipientReason: "Você recebeu este e-mail porque foi indicado como responsável legal em um cadastro na Connect Skills.",
    }),
  };
}

export async function sendParentalConsentEmail(email: string, candidateName: string) {
  return send(email, buildParentalConsentEmail(candidateName), "Erro ao enviar email de consentimento parental:");
}

// ---------------------------------------------------------------------------
// Processo seletivo
// ---------------------------------------------------------------------------

export function buildVideoRequestEmail(candidateName: string, vacancyTitle: string, vacancyLink: string): BuiltEmail {
  return {
    subject: `Solicitação de Vídeo - Vaga: ${vacancyTitle} - Connect Skills`,
    html: renderEmail({
      preheader: `A empresa quer conhecer você melhor para a vaga de ${vacancyTitle}.`,
      badge: "Nova etapa",
      title: "Vídeo de apresentação",
      greeting: `Olá, ${candidateName}`,
      body:
        paragraph(`Parabéns! A empresa gostou do seu perfil para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong> e gostaria de conhecer você melhor.`) +
        paragraph("Grave ou envie um vídeo de apresentação de até <strong>3 minutos</strong>."),
      cta: { label: "Acessar vaga e enviar vídeo", url: vacancyLink },
      footnote: "Boa sorte!",
    }),
  };
}

export async function sendVideoRequestEmail(
  email: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  return send(email, buildVideoRequestEmail(candidateName, vacancyTitle, vacancyLink), "Erro ao enviar email de solicitação de vídeo:");
}

export function buildFeedbackEmail(
  candidateName: string,
  vacancyTitle: string,
  status: "APPROVED" | "REJECTED",
  justification?: string,
): BuiltEmail {
  const isApproved = status === "APPROVED";

  return {
    subject: `Feedback da Vaga: ${vacancyTitle} - Connect Skills`,
    html: renderEmail({
      preheader: `A empresa enviou um feedback sobre sua candidatura para ${vacancyTitle}.`,
      badge: isApproved ? "Aprovado" : "Não selecionado",
      tone: isApproved ? "success" : "danger",
      title: "Feedback do processo seletivo",
      greeting: `Olá, ${candidateName}`,
      body:
        paragraph(`A empresa enviou um feedback sobre sua candidatura para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong>.`) +
        paragraph(isApproved
          ? "Você foi <strong>aprovado</strong> nesta etapa do processo seletivo."
          : "Desta vez você <strong>não foi selecionado</strong> para seguir no processo.") +
        (justification ? infoBox(multiline(justification), isApproved ? "success" : "danger", "Mensagem da empresa") : ""),
      footnote: "Obrigado por utilizar a Connect Skills!",
    }),
  };
}

export async function sendFeedbackEmail(
  email: string,
  candidateName: string,
  vacancyTitle: string,
  status: "APPROVED" | "REJECTED",
  justification?: string,
) {
  return send(email, buildFeedbackEmail(candidateName, vacancyTitle, status, justification), "Erro ao enviar email de feedback:");
}

export function buildVideoReceivedEmail(
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  loginLink: string,
): BuiltEmail {
  return {
    subject: `Vídeo Recebido: ${candidateName} - Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${candidateName} enviou o vídeo de apresentação para ${vacancyTitle}.`,
      badge: "Vídeo recebido",
      tone: "success",
      title: "Novo vídeo de apresentação",
      greeting: `Olá, ${companyName}`,
      body: paragraph(`O candidato <strong>${escapeHtml(candidateName)}</strong> enviou o vídeo de apresentação solicitado para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong>.`),
      cta: { label: "Fazer login e ver vídeo", url: loginLink },
      footnote: "Acesse a plataforma para avaliar o candidato.",
    }),
  };
}

export async function sendVideoReceivedEmail(
  email: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  loginLink: string,
) {
  return send(email, buildVideoReceivedEmail(companyName, candidateName, vacancyTitle, loginLink), "Erro ao enviar email de vídeo recebido:");
}

export function buildNewApplicationEmail(
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
): BuiltEmail {
  return {
    subject: `Nova Candidatura: ${candidateName} - Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${candidateName} se candidatou para ${vacancyTitle}.`,
      badge: "Nova candidatura",
      title: "Você recebeu uma nova candidatura",
      greeting: `Olá, ${companyName}`,
      body: paragraph(`O candidato <strong>${escapeHtml(candidateName)}</strong> acabou de se candidatar à vaga de <strong>${escapeHtml(vacancyTitle)}</strong> e completou o questionário.`),
      cta: { label: "Ver candidatura", url: vacancyLink },
      footnote: "Acesse a plataforma para avaliar o candidato.",
    }),
  };
}

export async function sendNewApplicationEmail(
  email: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  return send(email, buildNewApplicationEmail(companyName, candidateName, vacancyTitle, vacancyLink), "Erro ao enviar email de nova candidatura:");
}

export function buildVideoExpiredCandidateEmail(candidateName: string, vacancyTitle: string): BuiltEmail {
  return {
    subject: `Prazo Encerrado: Vídeo - Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `O prazo para enviar o vídeo da vaga ${vacancyTitle} terminou.`,
      badge: "Prazo encerrado",
      tone: "danger",
      title: "O prazo do vídeo terminou",
      greeting: `Olá, ${candidateName}`,
      body:
        paragraph(`O prazo para envio do vídeo de apresentação da vaga de <strong>${escapeHtml(vacancyTitle)}</strong> chegou ao fim.`) +
        paragraph("Para manter a organização e a agilidade do processo seletivo, o link de gravação e envio não está mais disponível."),
      footnote: "Desejamos sucesso nas suas próximas candidaturas.",
    }),
  };
}

export async function sendVideoExpiredCandidateEmail(email: string, candidateName: string, vacancyTitle: string) {
  return send(email, buildVideoExpiredCandidateEmail(candidateName, vacancyTitle), "Erro ao enviar email de video expired (candidate):");
}

export function buildVideoExpiredCompanyEmail(
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  platformLink: string,
): BuiltEmail {
  return {
    subject: `Prazo Encerrado: Vídeo de ${candidateName} - Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${candidateName} não enviou o vídeo dentro do prazo para ${vacancyTitle}.`,
      badge: "Prazo encerrado",
      tone: "warning",
      title: "Vídeo não enviado no prazo",
      greeting: `Olá, ${companyName}`,
      body: paragraph(`O candidato <strong>${escapeHtml(candidateName)}</strong> não enviou o vídeo de apresentação dentro do prazo estipulado para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong>.`),
      cta: { label: "Acessar a plataforma", url: platformLink },
      footnote: "Você pode acessar o ranking da vaga para decidir sobre esta candidatura.",
    }),
  };
}

export async function sendVideoExpiredCompanyEmail(
  email: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  platformLink: string,
) {
  return send(email, buildVideoExpiredCompanyEmail(companyName, candidateName, vacancyTitle, platformLink), "Erro ao enviar email de video expired (company):");
}

// ---------------------------------------------------------------------------
// Entrevistas e mentorias
// ---------------------------------------------------------------------------

export function buildInterviewScheduledEmail(
  candidateName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  endTime: string,
  confirmLink: string,
): BuiltEmail {
  return {
    subject: `Entrevista Agendada com Mentor - Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `Entrevista com mentor em ${date}, das ${startTime} às ${endTime}. Confirme sua presença.`,
      badge: "Entrevista agendada",
      title: "Você tem uma entrevista com um mentor",
      greeting: `Olá, ${candidateName}`,
      body:
        paragraph(`A empresa agendou uma entrevista com um de nossos mentores para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong>.`) +
        eventBox(date, `${startTime} – ${endTime}`) +
        paragraph("Confirme sua presença clicando no botão abaixo:"),
      cta: { label: "Confirmar presença", url: confirmLink },
      footnote: "O mentor só será notificado depois que você confirmar sua presença.",
    }),
  };
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
  return send(
    candidateEmail,
    buildInterviewScheduledEmail(candidateName, vacancyTitle, date, startTime, endTime, confirmLink),
    "Erro ao enviar email de entrevista agendada:",
  );
}

export function buildOnsiteInterviewScheduledEmail(
  candidateName: string,
  companyName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  confirmLink: string,
): BuiltEmail {
  return {
    subject: `Convite para Entrevista Presencial - Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${companyName} convidou você para uma entrevista presencial em ${date}, às ${startTime}.`,
      badge: "Entrevista presencial",
      title: "Você foi convidado para uma entrevista presencial",
      greeting: `Olá, ${candidateName}`,
      body:
        paragraph(`A empresa <strong>${escapeHtml(companyName)}</strong> convidou você para uma entrevista presencial para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong>.`) +
        eventBox(date, startTime) +
        paragraph("Confirme ou recuse sua presença pelo botão abaixo:"),
      cta: { label: "Acessar convite", url: confirmLink },
      footnote: "A empresa aguarda a sua confirmação.",
    }),
  };
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
  return send(
    candidateEmail,
    buildOnsiteInterviewScheduledEmail(candidateName, companyName, vacancyTitle, date, startTime, confirmLink),
    "Erro ao enviar email de entrevista presencial:",
  );
}

export function buildInterviewConfirmedToMentorEmail(
  mentorName: string,
  candidateName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  endTime: string,
): BuiltEmail {
  return {
    subject: `Entrevista Confirmada - ${candidateName} | ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${candidateName} confirmou a entrevista de ${date}, das ${startTime} às ${endTime}.`,
      badge: "Entrevista confirmada",
      tone: "success",
      title: "Um candidato confirmou a entrevista",
      greeting: `Olá, ${mentorName}`,
      body:
        paragraph(`Um candidato confirmou presença na entrevista para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong>.`) +
        eventBox(date, `${startTime} – ${endTime}`, `Candidato: ${candidateName}`, "success"),
      footnote: "Acesse a plataforma Connect Skills para mais detalhes.",
    }),
  };
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
  return send(
    mentorEmail,
    buildInterviewConfirmedToMentorEmail(mentorName, candidateName, vacancyTitle, date, startTime, endTime),
    "Erro ao enviar email para mentor:",
  );
}

export function buildInterviewConfirmedToCompanyEmail(
  companyName: string,
  candidateName: string,
  mentorName: string,
  vacancyTitle: string,
  date: string,
  startTime: string,
  endTime: string,
  vacancyLink: string,
): BuiltEmail {
  return {
    subject: `Mentoria Confirmada: ${candidateName} – Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `A mentoria de ${candidateName} com ${mentorName} foi confirmada para ${date}.`,
      badge: "Mentoria confirmada",
      tone: "success",
      title: "Mentoria confirmada!",
      greeting: `Olá, ${companyName}`,
      body:
        paragraph(`A mentoria do candidato <strong>${escapeHtml(candidateName)}</strong> com o mentor <strong>${escapeHtml(mentorName)}</strong> para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong> foi confirmada.`) +
        eventBox(date, `${startTime} – ${endTime}`, `Mentor: ${mentorName}`, "success"),
      cta: { label: "Ver vaga no painel", url: vacancyLink },
      footnote: "Acesse a Connect Skills para acompanhar o processo seletivo.",
    }),
  };
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
  return send(
    companyEmail,
    buildInterviewConfirmedToCompanyEmail(companyName, candidateName, mentorName, vacancyTitle, date, startTime, endTime, vacancyLink),
    "Erro ao enviar email de mentoria confirmada (empresa):",
  );
}

export function buildInterviewExpiredToCompanyEmail(
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
): BuiltEmail {
  return {
    subject: `Convite de Mentoria Expirado: ${candidateName} – Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${candidateName} não respondeu ao convite de mentoria para ${vacancyTitle}.`,
      badge: "Convite expirado",
      tone: "warning",
      title: "Convite de mentoria expirado",
      greeting: `Olá, ${companyName}`,
      body:
        paragraph(`O candidato <strong>${escapeHtml(candidateName)}</strong> não respondeu ao convite de mentoria para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong> dentro do prazo de 3 dias.`) +
        paragraph('O convite foi marcado automaticamente como <strong style="color: #DC2626;">expirado</strong>.'),
      cta: { label: "Ver vaga no painel", url: vacancyLink },
      footnote: "Você pode agendar uma nova sessão de mentoria para este candidato, se desejar.",
    }),
  };
}

export async function sendInterviewExpiredToCompanyEmail(
  companyEmail: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  return send(
    companyEmail,
    buildInterviewExpiredToCompanyEmail(companyName, candidateName, vacancyTitle, vacancyLink),
    "Erro ao enviar email de mentoria expirada (empresa):",
  );
}

export function buildMentorFeedbackToCompanyEmail(
  companyName: string,
  candidateName: string,
  mentorName: string,
  vacancyTitle: string,
  vacancyLink: string,
): BuiltEmail {
  return {
    subject: `Relatório de Mentoria Disponível: ${candidateName} – Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${mentorName} enviou o relatório da entrevista com ${candidateName}.`,
      badge: "Relatório disponível",
      title: "O relatório da entrevista chegou",
      greeting: `Olá, ${companyName}`,
      body: paragraph(`O mentor <strong>${escapeHtml(mentorName)}</strong> acabou de enviar o relatório da entrevista com o candidato <strong>${escapeHtml(candidateName)}</strong> para a vaga de <strong>${escapeHtml(vacancyTitle)}</strong>.`),
      cta: { label: "Ver relatório no ranking", url: vacancyLink },
      footnote: "Acesse a plataforma para decidir sobre este candidato.",
    }),
  };
}

export async function sendMentorFeedbackToCompanyEmail(
  companyEmail: string,
  companyName: string,
  candidateName: string,
  mentorName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  return send(
    companyEmail,
    buildMentorFeedbackToCompanyEmail(companyName, candidateName, mentorName, vacancyTitle, vacancyLink),
    "Erro ao enviar email de feedback do mentor para a empresa:",
  );
}

// ---------------------------------------------------------------------------
// Contato (interno)
// ---------------------------------------------------------------------------

export function buildContactEmail(fullName: string, userType: string, subject: string, message: string): BuiltEmail {
  const row = (label: string, value: string) =>
    `<tr><td style="padding: 6px 0; width: 130px; font-weight: 700; color: #0F172A; vertical-align: top;">${label}</td><td style="padding: 6px 0; color: #475569;">${escapeHtml(value)}</td></tr>`;

  return {
    subject: `[Contato - ${userType}] ${subject}`,
    html: renderEmail({
      preheader: `${fullName} (${userType}): ${subject}`,
      badge: "Formulário de contato",
      title: "Nova mensagem de contato",
      body:
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 16px; font-family: 'Montserrat', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px;">
          ${row("Nome", fullName)}
          ${row("Tipo de usuário", userType)}
          ${row("Assunto", subject)}
        </table>` +
        infoBox(multiline(message), "brand", "Mensagem"),
      recipientReason: "Mensagem enviada pelo formulário de contato do site da Connect Skills.",
    }),
  };
}

export async function sendContactEmail(
  fullName: string,
  userType: string,
  subject: string,
  message: string
) {
  const adminEmail = "connect0skills@gmail.com";
  return send(adminEmail, buildContactEmail(fullName, userType, subject, message), "Erro ao enviar email de contato:");
}

// ---------------------------------------------------------------------------
// Propostas
// ---------------------------------------------------------------------------

export function buildProposalEmail(
  candidateName: string,
  companyName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  const company = escapeHtml(companyName);
  const vacancy = escapeHtml(vacancyTitle);

  return {
    subject: `Você recebeu uma proposta de emprego! - ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${companyName} enviou uma proposta para a vaga de ${vacancyTitle}.`,
      badge: "Nova proposta",
      tone: "success",
      title: "Parabéns! Você recebeu uma proposta",
      greeting: `Olá, ${candidateName}`,
      body:
        paragraph(`A empresa <strong>${company}</strong> enviou uma proposta formal para a vaga de <strong>${vacancy}</strong>.`) +
        paragraph("Acesse a Connect Skills para ver os detalhes da proposta, como salário, modelo de trabalho e data de início, e dar a sua resposta."),
      cta: { label: "Ver proposta e responder", url: vacancyLink },
      footnote: "Você pode aceitar ou recusar diretamente pela plataforma. Boa sorte!",
    }),
  };
}

export async function sendProposalEmail(
  candidateEmail: string,
  candidateName: string,
  companyName: string,
  vacancyTitle: string,
  vacancyLink: string,
) {
  return send(candidateEmail, buildProposalEmail(candidateName, companyName, vacancyTitle, vacancyLink), "Erro ao enviar email de proposta:");
}

export function buildProposalResponseToCompanyEmail(
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  accepted: boolean,
  vacancyLink: string,
  justification?: string | null,
) {
  const candidate = escapeHtml(candidateName);
  const vacancy = escapeHtml(vacancyTitle);

  return {
    subject: accepted
      ? `Proposta Aceita: ${candidateName} – Vaga: ${vacancyTitle}`
      : `Proposta Recusada: ${candidateName} – Vaga: ${vacancyTitle}`,
    html: renderEmail({
      preheader: `${candidateName} ${accepted ? "aceitou" : "recusou"} a proposta para a vaga de ${vacancyTitle}.`,
      badge: accepted ? "Proposta aceita" : "Proposta recusada",
      tone: accepted ? "success" : "danger",
      title: accepted ? `${candidate} aceitou sua proposta!` : `${candidate} recusou sua proposta`,
      greeting: `Olá, ${companyName}`,
      body:
        paragraph(`O candidato <strong>${candidate}</strong> ${accepted ? "aceitou" : "recusou"} a proposta para a vaga de <strong>${vacancy}</strong>.`) +
        (justification
          ? infoBox(escapeHtml(justification).replace(/\n/g, "<br />"), accepted ? "success" : "danger", "Comentário do candidato")
          : ""),
      cta: { label: "Ver vaga no painel", url: vacancyLink },
      footnote: accepted
        ? "Entre em contato com o candidato para alinhar os próximos passos da contratação."
        : "Você pode seguir com outros candidatos do ranking desta vaga.",
    }),
  };
}

export async function sendProposalResponseToCompanyEmail(
  companyEmail: string,
  companyName: string,
  candidateName: string,
  vacancyTitle: string,
  accepted: boolean,
  vacancyLink: string,
  justification?: string | null,
) {
  return send(
    companyEmail,
    buildProposalResponseToCompanyEmail(companyName, candidateName, vacancyTitle, accepted, vacancyLink, justification),
    "Erro ao enviar email de resposta de proposta (empresa):",
  );
}
