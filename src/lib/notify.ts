import "server-only";
import { Resend } from "resend";

// Sends via Resend when configured; otherwise logs, so local dev needs no email account.
export async function notifyOwner(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[notify] RESEND_API_KEY not set — would email ${to}: ${subject}\n${text}`);
    return;
  }
  const from = process.env.NOTIFY_FROM ?? "Portfolio <onboarding@resend.dev>";
  const { error } = await new Resend(key).emails.send({ from, to, subject, text });
  if (error) console.error("[notify] Resend failed", error);
}
