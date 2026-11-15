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
  const gmailUser =
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    "pranavparmar1809@gmail.com";
  const gmailPass =
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    "rxkayldwhzxgfevh";

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
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });
    }

    // Default to Gmail service
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
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
        `"HariSumiran Mandir" <${process.env.GMAIL_USER || process.env.SMTP_USER || "pranavparmar1809@gmail.com"}>`;

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

export interface NewUserOnboardingOptions {
  name: string;
  gujaratiName?: string;
  phone: string;
  email?: string;
  memberId?: string;
  familyId?: string;
  familyName?: string;
  role?: string;
  responsibilities?: string[] | { title?: string; gujaratiTitle?: string; type?: string }[];
  zone?: string;
  area?: string;
  sabhaCategory?: string;
  department?: string;
  mandir?: string;
  channel?: "Direct App Registration" | "Google Sign-In" | "Apple Sign-In" | "Admin Directory Addition";
  onboardedAt?: Date | string;
}

/**
 * Dispatches an institutional alert email to the Super Admin whenever a new devotee or user onboards.
 * Default recipient: pranavparmar1809@gmail.com
 */
export async function sendNewUserOnboardingAlert(details: NewUserOnboardingOptions) {
  const adminRecipient =
    process.env.ADMIN_NOTIFICATION_EMAIL || "pranavparmar1809@gmail.com";
  const transporter = createTransporter();

  const cleanPhone = details.phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : details.phone;
  const timestamp = details.onboardedAt
    ? new Date(details.onboardedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const superAdminUrl = `${appUrl}/super-admin`;

  // Format responsibilities list into string
  let respString = "Mandir Devotee (General Member)";
  if (Array.isArray(details.responsibilities) && details.responsibilities.length > 0) {
    respString = details.responsibilities
      .map((r: any) => (typeof r === "string" ? r : r.title || r.type))
      .filter(Boolean)
      .join(", ");
  }

  if (transporter) {
    try {
      const fromAddress =
        process.env.EMAIL_FROM ||
        `"HariSumiran Mandir" <${process.env.GMAIL_USER || process.env.SMTP_USER || "pranavparmar1809@gmail.com"}>`;

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Devotee Onboarded - HariSumiran</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E7E5E4; box-shadow: 0 20px 40px -15px rgba(217, 119, 6, 0.08);">
          
          <!-- Sacred Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #D97706 0%, #EA580C 50%, #C2410C 100%); padding: 32px 28px; text-align: center;">
              <div style="font-size: 36px; margin-bottom: 6px;">🛕</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">HariSumiran</h1>
              <p style="margin: 4px 0 0; color: #FEF3C7; font-size: 13px; font-weight: 600;">
                Shree Swaminarayan Mandir • HariPrabodham, Nadiad
              </p>
              <div style="margin-top: 16px;">
                <span style="display: inline-block; background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 9999px; padding: 4px 14px; color: #ffffff; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                  🔔 New Devotee Onboarded
                </span>
              </div>
            </td>
          </tr>

          <!-- Salutation & Headline -->
          <tr>
            <td style="padding: 28px 28px 16px 28px;">
              <div style="display: inline-block; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 4px 12px; margin-bottom: 12px;">
                <span style="color: #92400E; font-size: 12.5px; font-weight: 700;">
                  જય સ્વામિનારાયણ 🙏 Jay Swaminarayan
                </span>
              </div>
              <h2 style="margin: 0 0 6px; color: #1C1917; font-size: 20px; font-weight: 800; letter-spacing: -0.3px;">
                ${details.name} ${details.gujaratiName ? `<span style="color: #78716C; font-weight: 600; font-size: 16px;">(${details.gujaratiName})</span>` : ""}
              </h2>
              <p style="margin: 0; color: #78716C; font-size: 13.5px; line-height: 1.5;">
                A new devotee account has successfully completed onboarding registration on the HariSumiran App. Institutional details are recorded below:
              </p>
            </td>
          </tr>

          <!-- Structured Profile Metadata Table -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #FAFAF9; border-radius: 16px; overflow: hidden; border: 1px solid #E7E5E4;">
                
                <!-- Phone -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C; width: 38%;">
                    Mobile Number:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 13px; font-weight: 800; color: #1C1917;">
                    <a href="tel:${cleanPhone}" style="color: #D97706; text-decoration: none;">${formattedPhone}</a>
                    <span style="margin-left: 8px;">
                      <a href="https://wa.me/91${cleanPhone.slice(-10)}" style="color: #16A34A; text-decoration: none; font-size: 11px; font-weight: 700; background: #DCFCE7; border: 1px solid #86EFAC; padding: 2px 7px; border-radius: 6px;">WhatsApp ➜</a>
                    </span>
                  </td>
                </tr>

                <!-- Email -->
                ${details.email ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Email Address:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 13px; font-weight: 600; color: #1C1917;">
                    <a href="mailto:${details.email}" style="color: #0284C7; text-decoration: none;">${details.email}</a>
                  </td>
                </tr>
                ` : ""}

                <!-- Member ID -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Member ID / Code:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-family: 'Courier New', Courier, monospace; font-weight: 800; color: #7C2D12; background: #FEF3C7;">
                    ${details.memberId || "MEM-NAD-PENDING"}
                  </td>
                </tr>

                <!-- Family Parivar -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Family Household:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 13px; font-weight: 700; color: #1C1917;">
                    ${details.familyName || `${details.name} Parivar`}
                  </td>
                </tr>

                <!-- Primary Role -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Primary Account Role:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 800; color: #15803D;">
                    ${details.role ? details.role.toUpperCase() : "MEMBER"}
                  </td>
                </tr>

                <!-- Assigned Responsibilities -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Assigned Duties:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 600; color: #44403C;">
                    ${respString}
                  </td>
                </tr>

                <!-- Zone & Area -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Zone & Area:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 600; color: #1C1917;">
                    ${details.zone || "Nadiad Central"} ${details.area ? `• ${details.area}` : ""}
                  </td>
                </tr>

                <!-- Sabha Category -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Sabha Category:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 600; color: #1C1917;">
                    ${details.sabhaCategory || "General Devotee Sabha"}
                  </td>
                </tr>

                <!-- Channel -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #78716C;">
                    Onboarding Channel:
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E7E5E4; font-size: 12px; font-weight: 700; color: #D97706;">
                    ${details.channel || "Direct App Registration"}
                  </td>
                </tr>

                <!-- Timestamp -->
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #78716C;">
                    Registration Time:
                  </td>
                  <td style="padding: 12px 16px; font-size: 12px; font-family: 'Courier New', Courier, monospace; font-weight: 600; color: #44403C;">
                    ${timestamp}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Action Button: Open Super Admin Console -->
          <tr>
            <td style="padding: 8px 28px 28px 28px; text-align: center;">
              <a href="${superAdminUrl}" style="display: block; background: linear-gradient(135deg, #D97706 0%, #EA580C 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 24px; border-radius: 14px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);">
                Open Super Admin Console & Manage Roles ➜
              </a>
              <p style="margin: 12px 0 0; color: #A8A29E; font-size: 11px;">
                Direct link: <a href="${superAdminUrl}" style="color: #78716C;">${superAdminUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #FAFAF9; border-top: 1px solid #E7E5E4; padding: 20px 28px; text-align: center;">
              <p style="margin: 0; color: #78716C; font-size: 11.5px; font-weight: 500;">
                HariSumiran Automated Institutional Alert • HariPrabodham, Nadiad
              </p>
              <p style="margin: 4px 0 0; color: #A8A29E; font-size: 10.5px;">
                You are receiving this notification as the designated Super Administrator (${adminRecipient}).
              </p>
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
        to: adminRecipient,
        subject: `🔔 New Devotee Onboarded: ${details.name} (${formattedPhone}) • HariSumiran`,
        text: `Jay Swaminarayan!\n\nA new devotee has onboarded onto HariSumiran:\n\nName: ${details.name}\nPhone: ${formattedPhone}\nEmail: ${details.email || "N/A"}\nMember ID: ${details.memberId || "N/A"}\nFamily: ${details.familyName || "N/A"}\nRole: ${details.role || "MEMBER"}\nDuties: ${respString}\nZone: ${details.zone || "Nadiad Central"}\nTimestamp: ${timestamp}\n\nSuper Admin Console: ${superAdminUrl}\n\nHariSumiran • HariPrabodham, Nadiad`,
        html: htmlContent,
      });

      console.log(`[Onboarding Alert Success] Sent alert for ${details.name} to ${adminRecipient}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("[Onboarding Alert Exception]:", err.message);
      return { success: false, error: err.message };
    }
  }

  // Development logging fallback
  console.log(`\n======================================================`);
  console.log(`[Onboarding Alert Dev Mode] SMTP not configured.`);
  console.log(`To: ${adminRecipient}`);
  console.log(`Devotee: ${details.name} (${formattedPhone})`);
  console.log(`======================================================\n`);

  return { success: true, isDevMode: true };
}
