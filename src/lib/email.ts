import nodemailer from "nodemailer";

export interface SendEmailOtpOptions {
  email: string;
  phone?: string;
  otp: string;
}

/**
 * Creates an SMTP transporter.
 * Supports standard Gmail with App Password, or custom SMTP configurations.
 */
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (gmailUser && gmailPass) {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
    }

    // Default to Gmail service
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  return null;
}

/**
 * Dispatches a sacred devotional 6-digit OTP to the devotee's email address.
 * Gracefully falls back to development logging if SMTP credentials are not yet set.
 */
export async function sendEmailOtp({ email, phone, otp }: SendEmailOtpOptions) {
  const cleanEmail = email.trim().toLowerCase();
  const transporter = createTransporter();

  if (transporter) {
    try {
      const fromAddress =
        process.env.EMAIL_FROM ||
        `"HariSumiran Mandir" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`;

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HariSumiran Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FFFDF9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFDF9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1.5px solid #FFEDD5; box-shadow: 0 10px 30px rgba(234, 88, 12, 0.08);">
          
          <!-- Sacred Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6F00 0%, #EA580C 100%); padding: 32px 24px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">🛕</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">HariSumiran</h1>
              <p style="margin: 4px 0 0; color: #FFEDD5; font-size: 13px; font-weight: 500;">Shree Swaminarayan Mandir • HariPrabodham</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="display: inline-block; background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 20px; padding: 4px 14px; margin-bottom: 16px;">
                <span style="color: #C2410C; font-size: 13px; font-weight: 700;">જય સ્વામિનારાયણ 🙏 Jay Swaminarayan</span>
              </div>

              <h2 style="margin: 0 0 12px; color: #1E293B; font-size: 20px; font-weight: 700;">
                Your Verification Code
              </h2>
              <p style="margin: 0 0 24px; color: #64748B; font-size: 14.5px; line-height: 1.6;">
                Use the following 6-digit OTP to verify your email and complete your devotee onboarding registration on the HariSumiran App:
              </p>

              <!-- OTP Box -->
              <div style="background: #FFFBF5; border: 2px dashed #FDBA74; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #EA580C; display: inline-block;">
                  ${otp}
                </span>
                <p style="margin: 8px 0 0; color: #9A3412; font-size: 12px; font-weight: 600;">
                  ⏱️ Valid for 10 minutes
                </p>
              </div>

              <p style="margin: 0 0 16px; color: #64748B; font-size: 13px; line-height: 1.5;">
                ${phone ? `Registered Mobile: <strong>+91 ${phone}</strong><br>` : ""}
                If you did not request this verification code, please ignore this email. Your account remains secure.
              </p>

              <div style="border-top: 1px solid #F1F5F9; margin-top: 24px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #94A3B8; font-size: 11.5px;">
                  Secured Devotee Authentication • One Mandir, One App
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: cleanEmail,
        subject: `Your HariSumiran Verification Code: ${otp}`,
        text: `Jay Swaminarayan!\n\nYour HariSumiran verification code is: ${otp}\nValid for 10 minutes.\n\nShree Swaminarayan Mandir`,
        html: htmlContent,
      });

      console.log(`[Email Dispatch Success] OTP sent to ${cleanEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email Dispatch Exception]:", err.message);
      return { success: false, error: err.message };
    }
  }

  // Development Fallback if GMAIL_USER / GMAIL_APP_PASSWORD are not configured in .env.local yet
  console.log(`\n======================================================`);
  console.log(`[Email OTP Dev Mode] Gmail SMTP credentials not yet in .env.local.`);
  console.log(`📧 Sent OTP to Devotee Email: ${cleanEmail}`);
  console.log(`🔑 Verification Code: [ ${otp} ]`);
  console.log(`======================================================\n`);

  return {
    success: true,
    isDevMode: true,
    message: `Verification code generated in dev mode: ${otp}`,
  };
}
