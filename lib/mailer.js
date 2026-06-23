import nodemailer from "nodemailer";

// SMTP über Hostinger Webmail (info@hoopsgermany.de)
let transporter;

export function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Sendet eine E-Mail über den konfigurierten SMTP-Account.
 * @param {{ to: string, subject: string, html: string, text?: string, replyTo?: string }} opts
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const from = `Hoops Germany <${process.env.SMTP_USER || "info@hoopsgermany.de"}>`;
  return getTransporter().sendMail({ from, to, subject, html, text, replyTo });
}

export default sendMail;
