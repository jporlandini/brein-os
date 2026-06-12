import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DeliveryEmailPayload {
  to: string;
  clientName: string;
  taskTitle: string;
  deliverables: string[];
  credentials: { user: string; password: string } | null;
}

export async function sendDelivery(payload: DeliveryEmailPayload) {
  const { to, clientName, taskTitle, deliverables, credentials } = payload;

  const deliverablesList =
    deliverables.length > 0
      ? deliverables.map((d) => `<li><a href="${d}">${d}</a></li>`).join("")
      : "<li>Ver adjuntos en este correo.</li>";

  const credentialsSection = credentials
    ? `
      <h3>Credenciales de acceso</h3>
      <p>Usuario: <strong>${credentials.user}</strong><br/>
      Contraseña: <strong>${credentials.password}</strong></p>
    `
    : "";

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to,
    subject: `✅ Entrega lista: ${taskTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#7c3aed">Brain OS — Entrega Completada</h2>
        <p>Hola <strong>${clientName}</strong>,</p>
        <p>Nos complace informarte que la tarea <strong>"${taskTitle}"</strong> ha sido completada y está lista para tu revisión.</p>
        <h3>Entregables</h3>
        <ul>${deliverablesList}</ul>
        ${credentialsSection}
        <hr style="border:1px solid #e2e8f0;margin:24px 0"/>
        <p style="color:#94a3b8;font-size:12px">Brain OS · Plataforma de gestión de agencia</p>
      </div>
    `,
  });
}
