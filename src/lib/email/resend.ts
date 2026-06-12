import { Resend } from "resend";

// Lazy singleton — avoids build-time failures when RESEND_API_KEY is not set.
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.RESEND_FROM ?? "Brain OS <noreply@brein.cl>";

interface DeliveryEmailPayload {
  to: string;
  clientName: string;
  taskTitle: string;
  deliverables: string[];
  credentials: { user: string; password: string } | null;
}

export async function sendDelivery(payload: DeliveryEmailPayload) {
  const { to, clientName, taskTitle, deliverables, credentials } = payload;

  const deliverableRows =
    deliverables.length > 0
      ? deliverables
          .map(
            (d) =>
              `<tr><td style="padding:8px 0;border-bottom:1px solid #1e2233;">
                 <a href="${d}" style="color:#d946ef;font-family:monospace;font-size:13px;word-break:break-all;text-decoration:none;">${d}</a>
               </td></tr>`
          )
          .join("")
      : `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;font-family:monospace;">Ver adjuntos en este correo.</td></tr>`;

  const credentialsBlock = credentials
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr>
          <td style="padding:16px;background:#0d0d1a;border:1px solid #1e2233;border-radius:8px;">
            <p style="margin:0 0 12px;font-size:11px;font-family:monospace;color:#475569;letter-spacing:0.15em;text-transform:uppercase;">
              Credenciales de acceso
            </p>
            <p style="margin:0 0 6px;font-size:13px;font-family:monospace;color:#f1f5f9;">
              Usuario: <strong style="color:#d946ef;">${credentials.user}</strong>
            </p>
            <p style="margin:0;font-size:13px;font-family:monospace;color:#f1f5f9;">
              Contraseña: <strong style="color:#d946ef;">${credentials.password}</strong>
            </p>
          </td>
        </tr>
      </table>
    `
    : "";

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Entrega lista: ${taskTitle}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Entrega Brain OS</title>
</head>
<body style="margin:0;padding:0;background-color:#07070f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#07070f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0d0d1a;border:1px solid rgba(217,70,239,0.25);border-radius:8px;padding:8px 14px;">
                    <span style="font-family:monospace;font-size:14px;font-weight:700;letter-spacing:0.2em;color:#d946ef;">BRAIN</span>
                    <span style="font-family:monospace;font-size:14px;font-weight:700;letter-spacing:0.2em;color:#f1f5f9;">OS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0d0d1a;border:1px solid #1e2233;border-left:3px solid #d946ef;border-radius:12px;padding:28px;">

              <p style="margin:0 0 4px;font-family:monospace;font-size:10px;color:#475569;letter-spacing:0.25em;text-transform:uppercase;">
                Entrega completada
              </p>
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#f1f5f9;line-height:1.3;">
                ${taskTitle}
              </h1>

              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                Hola <strong style="color:#f1f5f9;">${clientName}</strong>, tu entrega está lista para revisión.
              </p>

              <!-- Deliverables -->
              <p style="margin:0 0 8px;font-family:monospace;font-size:10px;color:#475569;letter-spacing:0.15em;text-transform:uppercase;">
                Entregables
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${deliverableRows}
              </table>

              ${credentialsBlock}

              <!-- CTA hint -->
              <p style="margin:28px 0 0;font-size:13px;color:#475569;line-height:1.6;">
                Si tienes comentarios o correcciones, responde directamente a este correo o contáctanos a través del portal.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-family:monospace;font-size:10px;color:#1e2233;letter-spacing:0.2em;text-transform:uppercase;">
                Brain OS · Plataforma de Gestión de Agencia
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
