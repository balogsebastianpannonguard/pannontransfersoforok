import { randomBytes } from "crypto";
import type { Db } from "mongodb";
import nodemailer from "nodemailer";

const PORTAL_URL = (process.env.PARTNER_PORTAL_URL || "https://pannontransferkomplexxpartnerceg.vercel.app").replace(/\/$/, "");
const FEEDBACK_REQUESTS_COLLECTION = "feedback_requests";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TripLanguage = "hu" | "en";

interface CompletedTrip {
  _id?: unknown;
  portal?: string;
  companyName?: string;
  bookingCode?: string;
  language?: string;
  travelerName?: string;
  travelerEmail?: string;
  secondTravelerEmail?: string;
  pickupDate?: string;
  pickupTime?: string;
  fromAddress?: string;
  toAddress?: string;
  assignedDriverName?: string;
  assignedVehicleName?: string;
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.office365.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/** Az eddigi (nem NI) "Az utazása befejeződött" levél – változatlan tartalommal. */
function buildCompletionHtml(travelerName: string, bookingCode: string): string {
  return `<!DOCTYPE html><html lang="hu"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF8F5;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
<tr><td style="background:#0B1A2A;border-radius:12px 12px 0 0;padding:32px 40px;">
<p style="margin:0;font-size:12px;font-weight:700;color:#C9A962;letter-spacing:4px;text-transform:uppercase;">PANNON TRANSFER</p>
</td></tr>
<tr><td style="height:3px;background:#C9A962;"></td></tr>
<tr><td style="background:#fff;border-left:1px solid #E8E3DA;border-right:1px solid #E8E3DA;padding:36px 40px;">
<p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A1A;">Az utazása befejeződött</p>
<p style="margin:0 0 24px;font-size:14px;color:#7A7A7A;line-height:1.6;">Kedves ${esc(travelerName)}! Örömmel értesítjük, hogy az utazása sikeresen befejeződött. Köszönjük, hogy a Pannon Transfert választotta!</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF6EE;border:1px solid #E6D9B8;border-radius:8px;margin-bottom:24px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#C9A962;letter-spacing:2px;text-transform:uppercase;">FOGLALÁS KÓD</p>
<p style="margin:0;font-size:18px;font-weight:700;color:#1A1A1A;">#${esc(bookingCode)}</p>
</td></tr></table>
<p style="margin:0;font-size:13px;color:#7A7A7A;line-height:1.7;">Ha kérdése van, forduljon ügyfélszolgálatunkhoz.<br>E-mail: <a href="mailto:balogh.sebastian@pannonguard.hu" style="color:#C9A962;">balogh.sebastian@pannonguard.hu</a><br>Telefon: +36 30 665 4135</p>
</td></tr>
<tr><td style="height:1px;background:#C9A962;"></td></tr>
<tr><td style="background:#0B1A2A;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
<p style="margin:0;font-size:10px;color:#7A7A7A;">&copy; 2026 Pannon Transfer Executive Travel. Minden jog fenntartva.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** NI utasoknak: befejezés + visszajelzési link, a foglalás nyelvén (hu/en). */
export function buildNiFeedbackRequestHtml(params: {
  travelerName: string;
  bookingCode: string;
  feedbackUrl: string;
  language: TripLanguage;
}): string {
  const en = params.language === "en";
  const t = en
    ? {
        title: "Your trip is complete",
        greeting: params.travelerName.trim() ? `Dear ${params.travelerName},` : "Dear Passenger,",
        body: "Your transfer has been completed successfully. Thank you for choosing Pannon Transfer!",
        ask: "Your feedback will greatly help with the development of our service. It takes only a minute.",
        button: "Share your feedback",
        code: "BOOKING CODE",
        fallback: "If the button does not work, copy this link into your browser:",
        contact: "If you have any questions, please contact our customer service.",
        phone: "Phone",
      }
    : {
        title: "Az utazása befejeződött",
        greeting: params.travelerName.trim() ? `Kedves ${params.travelerName}!` : "Kedves Utasunk!",
        body: "Az utazása sikeresen befejeződött. Köszönjük, hogy a Pannon Transfert választotta!",
        ask: "Visszajelzése nagyban segíti szolgáltatásunk fejlesztését. Kitöltése csupán egy percet vesz igénybe.",
        button: "Visszajelzés megadása",
        code: "FOGLALÁS KÓD",
        fallback: "Ha a gomb nem működik, másolja be ezt a linket a böngészőjébe:",
        contact: "Ha kérdése van, forduljon ügyfélszolgálatunkhoz.",
        phone: "Telefon",
      };

  return `<!DOCTYPE html><html lang="${en ? "en" : "hu"}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF8F5;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
<tr><td style="background:#0B1A2A;border-radius:12px 12px 0 0;padding:32px 40px;">
<p style="margin:0;font-size:12px;font-weight:700;color:#C9A962;letter-spacing:4px;text-transform:uppercase;">PANNON TRANSFER</p>
</td></tr>
<tr><td style="height:3px;background:#C9A962;"></td></tr>
<tr><td style="background:#fff;border-left:1px solid #E8E3DA;border-right:1px solid #E8E3DA;padding:36px 40px;">
<p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A1A;">${t.title}</p>
<p style="margin:0 0 6px;font-size:14px;color:#1A1A1A;line-height:1.6;font-weight:600;">${esc(t.greeting)}</p>
<p style="margin:0 0 16px;font-size:14px;color:#7A7A7A;line-height:1.6;">${t.body}</p>
<p style="margin:0 0 24px;font-size:14px;color:#7A7A7A;line-height:1.6;">${t.ask}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF6EE;border:1px solid #E6D9B8;border-radius:8px;margin-bottom:28px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#C9A962;letter-spacing:2px;text-transform:uppercase;">${t.code}</p>
<p style="margin:0;font-size:18px;font-weight:700;color:#1A1A1A;">#${esc(params.bookingCode)}</p>
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;"><tr><td align="center">
<a href="${params.feedbackUrl}" style="display:inline-block;background:#0B1A2A;color:#C9A962;text-decoration:none;font-size:15px;font-weight:700;padding:16px 36px;border-radius:10px;border:1px solid #C9A962;">${t.button}</a>
</td></tr></table>
<p style="margin:0 0 6px;font-size:12px;color:#9A9A9A;line-height:1.6;">${t.fallback}</p>
<p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="${params.feedbackUrl}" style="color:#C9A962;">${params.feedbackUrl}</a></p>
<p style="margin:0;font-size:13px;color:#7A7A7A;line-height:1.7;">${t.contact}<br>E-mail: <a href="mailto:balogh.sebastian@pannonguard.hu" style="color:#C9A962;">balogh.sebastian@pannonguard.hu</a><br>${t.phone}: +36 30 665 4135</p>
</td></tr>
<tr><td style="height:1px;background:#C9A962;"></td></tr>
<tr><td style="background:#0B1A2A;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
<p style="margin:0;font-size:10px;color:#7A7A7A;">&copy; 2026 Pannon Transfer Executive Travel</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/**
 * Lezárt fuvar értesítései. Hiba esetén sem dob kivételt: a fuvar lezárását ez nem akadályozhatja.
 *
 * - NI foglalás: az utas(ok) – az utas és a 2. utas – visszajelzési linket kapnak (utasonként saját linkkel).
 * - Egyéb partnerek: az eddigi egyszerű "Az utazása befejeződött" levél az utasnak.
 */
export async function notifyTripCompleted(db: Db, trip: CompletedTrip): Promise<void> {
  try {
    const bookingCode = trip.bookingCode || "";
    const isNi = trip.portal === "ni";
    const transporter = createTransporter();
    const from = `"Pannon Transfer" <${process.env.EMAIL_USER}>`;

    if (!isNi) {
      const travelerEmail = trip.travelerEmail;
      if (!travelerEmail || !EMAIL_PATTERN.test(travelerEmail)) return;
      await transporter.sendMail({
        from,
        to: travelerEmail,
        subject: `Az utazása befejeződött – #${bookingCode} – Pannon Transfer`,
        html: buildCompletionHtml(trip.travelerName || travelerEmail, bookingCode),
      });
      return;
    }

    const language: TripLanguage = trip.language === "en" ? "en" : "hu";
    const seen = new Set<string>();
    const travelers: Array<{ email: string; name: string }> = [];
    const add = (email: string | undefined, name: string) => {
      if (!email || !EMAIL_PATTERN.test(email.trim())) return;
      const key = email.trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      travelers.push({ email: email.trim(), name });
    };
    add(trip.travelerEmail, trip.travelerName || trip.travelerEmail || "");
    add(trip.secondTravelerEmail, "");

    const requests = db.collection(FEEDBACK_REQUESTS_COLLECTION);
    for (const traveler of travelers) {
      try {
        const bookingId = String(trip._id);
        // Ha már van kérés ehhez a foglaláshoz és címhez, azt használjuk (nincs duplikált levél/link)
        const existing = await requests.findOne({ bookingId, email: traveler.email });
        if (existing) continue;

        const token = randomBytes(24).toString("hex");
        await requests.insertOne({
          token,
          bookingId,
          bookingCode,
          portal: trip.portal,
          companyName: trip.companyName,
          travelerName: traveler.name,
          email: traveler.email,
          language,
          pickupDate: trip.pickupDate,
          pickupTime: trip.pickupTime,
          fromAddress: trip.fromAddress,
          toAddress: trip.toAddress,
          driverName: trip.assignedDriverName,
          vehicleName: trip.assignedVehicleName,
          createdAt: Date.now(),
        });

        await transporter.sendMail({
          from,
          to: traveler.email,
          subject:
            language === "en"
              ? `Your trip is complete – share your feedback – #${bookingCode}`
              : `Az utazása befejeződött – kérjük, adjon visszajelzést – #${bookingCode}`,
          html: buildNiFeedbackRequestHtml({
            travelerName: traveler.name,
            bookingCode,
            feedbackUrl: `${PORTAL_URL}/feedback/${token}`,
            language,
          }),
        });
      } catch (error) {
        console.error(`[trip-completion] feedback email failed for ${traveler.email}`, error);
      }
    }
  } catch (error) {
    console.error("[trip-completion] failed", error);
  }
}
