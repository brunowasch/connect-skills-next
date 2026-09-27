// Layout base dos e-mails transacionais da Connect Skills.
// Tudo em <table> com estilos inline: é o que Gmail, Outlook e Apple Mail renderizam de forma consistente.

export type EmailTone = "brand" | "success" | "warning" | "danger";

const COLORS = {
  brand: "#2563EB",
  text: "#0F172A",
  body: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  page: "#F1F5F9",
  white: "#FFFFFF",
};

const TONES: Record<EmailTone, { color: string; bg: string; border: string }> = {
  brand: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  success: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  warning: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  danger: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

const FONT = "'Montserrat', Arial, Helvetica, sans-serif";

function appUrl() {
  return (process.env.APP_URL || "").replace(/\/$/, "");
}

function logoUrl() {
  return process.env.EMAIL_LOGO_URL || `${appUrl()}/img/logos/logo-connect-skills.png`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Parágrafo padrão do corpo do e-mail. Aceita HTML (ex.: <strong>). */
export function paragraph(html: string) {
  return `<p style="margin: 0 0 16px; font-family: ${FONT}; font-size: 15px; line-height: 24px; color: ${COLORS.body};">${html}</p>`;
}

/** Caixa de destaque colorida (ex.: data da entrevista, comentário do candidato). */
export function infoBox(html: string, tone: EmailTone = "brand", title?: string) {
  const t = TONES[tone];
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 24px;">
      <tr>
        <td style="background: ${t.bg}; border: 1px solid ${t.border}; border-left: 4px solid ${t.color}; border-radius: 10px; padding: 16px 20px; font-family: ${FONT}; font-size: 14px; line-height: 22px; color: ${COLORS.body};">
          ${title ? `<p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: ${COLORS.text};">${title}</p>` : ""}
          ${html}
        </td>
      </tr>
    </table>`;
}

/** Código em destaque (verificação, login, recuperação de senha). */
export function codeBox(code: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 8px auto 24px;">
      <tr>
        <td align="center" style="background: ${TONES.brand.bg}; border: 1px dashed ${TONES.brand.border}; border-radius: 12px; padding: 16px 32px; font-family: 'Courier New', Courier, monospace; font-size: 30px; font-weight: 700; letter-spacing: 8px; color: ${COLORS.text};">${escapeHtml(code)}</td>
      </tr>
    </table>`;
}

/** Data e horário em destaque (entrevistas, mentorias). Recebe texto puro. */
export function eventBox(date: string, time: string, detail?: string, tone: EmailTone = "brand") {
  const t = TONES[tone];
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 24px;">
      <tr>
        <td align="center" style="background: ${t.bg}; border: 1px solid ${t.border}; border-radius: 12px; padding: 20px; font-family: ${FONT};">
          <p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: ${t.color};">Data e horário</p>
          <p style="margin: 8px 0 0; font-size: 20px; font-weight: 700; color: ${COLORS.text};">${escapeHtml(date)}</p>
          <p style="margin: 4px 0 0; font-size: 16px; color: ${COLORS.body};">${escapeHtml(time)}</p>
          ${detail ? `<p style="margin: 8px 0 0; font-size: 14px; color: ${COLORS.muted};">${escapeHtml(detail)}</p>` : ""}
        </td>
      </tr>
    </table>`;
}

function button(label: string, url: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 8px auto 12px;">
      <tr>
        <td align="center" bgcolor="${COLORS.brand}" style="border-radius: 10px; background: ${COLORS.brand};">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: ${FONT}; font-size: 15px; font-weight: 700; color: ${COLORS.white}; text-decoration: none; border-radius: 10px;">${label}</a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 8px; text-align: center; font-family: ${FONT}; font-size: 12px; line-height: 18px; color: ${COLORS.muted};">
      Se o botão não funcionar, copie e cole no navegador:<br />
      <a href="${url}" target="_blank" style="color: ${COLORS.brand}; word-break: break-all;">${url}</a>
    </p>`;
}

export interface RenderEmailOptions {
  /** Texto que aparece na prévia da caixa de entrada. */
  preheader: string;
  /** Selo acima do título (ex.: "Proposta aceita"). */
  badge?: string;
  tone?: EmailTone;
  title: string;
  /** Saudação, ex.: "Olá, Maria". Recebe texto puro (é escapado). */
  greeting?: string;
  /** Conteúdo em HTML — monte com paragraph() e infoBox(). */
  body: string;
  cta?: { label: string; url: string };
  /** Nota curta abaixo do botão. Aceita HTML. */
  footnote?: string;
  /** Substitui o "Você recebeu este e-mail porque tem uma conta na Connect Skills." do rodapé. */
  recipientReason?: string;
}

export function renderEmail({
  preheader,
  badge,
  tone = "brand",
  title,
  greeting,
  body,
  cta,
  footnote,
  recipientReason,
}: RenderEmailOptions) {
  const t = TONES[tone];
  const home = appUrl();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Connect Skills</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background: ${COLORS.page}; -webkit-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${COLORS.page};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px;">

          <tr>
            <td align="center" style="background: ${COLORS.white}; border-top: 4px solid ${COLORS.brand}; border-radius: 16px 16px 0 0; padding: 28px 32px 8px;">
              <a href="${home || "#"}" target="_blank" style="text-decoration: none;">
                <img src="${logoUrl()}" width="180" alt="Connect Skills" style="display: block; width: 180px; max-width: 100%; height: auto; border: 0;" />
              </a>
            </td>
          </tr>

          <tr>
            <td style="background: ${COLORS.white}; padding: 24px 40px 32px; font-family: ${FONT};">
              ${badge ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 16px;">
                <tr>
                  <td style="background: ${t.bg}; border: 1px solid ${t.border}; border-radius: 999px; padding: 4px 12px; font-family: ${FONT}; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; color: ${t.color};">${badge}</td>
                </tr>
              </table>` : ""}
              <h1 style="margin: 0 0 20px; font-family: ${FONT}; font-size: 24px; line-height: 32px; font-weight: 700; color: ${COLORS.text};">${title}</h1>
              ${greeting ? paragraph(escapeHtml(greeting) + ",") : ""}
              ${body}
              ${cta ? button(cta.label, cta.url) : ""}
            </td>
          </tr>

          <tr>
            <td style="background: ${COLORS.white}; border-top: 1px solid ${COLORS.border}; border-radius: 0 0 16px 16px; padding: 20px 40px; font-family: ${FONT}; font-size: 13px; line-height: 20px; color: ${COLORS.body};">
              ${footnote ? `<p style="margin: 0 0 8px;">${footnote}</p>` : ""}
              <p style="margin: 0;">Equipe <strong style="color: ${COLORS.text};">Connect Skills</strong></p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 24px 24px 0; font-family: ${FONT}; font-size: 12px; line-height: 18px; color: ${COLORS.muted};">
              ${recipientReason
      ? escapeHtml(recipientReason)
      : `Você recebeu este e-mail porque tem uma conta na
              ${home ? `<a href="${home}" target="_blank" style="color: ${COLORS.muted}; text-decoration: underline;">Connect Skills</a>` : "Connect Skills"}.`}<br />
              © ${year} Connect Skills. Todos os direitos reservados.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
