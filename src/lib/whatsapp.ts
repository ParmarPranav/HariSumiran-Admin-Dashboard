export interface SendWhatsAppOtpOptions {
  phone: string; // e.g. "9016357857" or "+919016357857"
  otp: string; // 6-digit verification code
}

/**
 * Dispatches a 6-digit OTP to the user's WhatsApp number using the Meta WhatsApp Cloud API.
 * If credentials are not yet configured in .env.local, falls back gracefully to dev mode.
 */
export async function sendWhatsAppOtp({ phone, otp }: SendWhatsAppOtpOptions) {
  const cleanPhone = phone.replace(/\D/g, "");
  const e164 = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

  // 1. Meta Cloud API live dispatch if credentials exist
  if (phoneNumberId && accessToken) {
    try {
      const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

      let payload: any;
      if (templateName) {
        payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: e164,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: otp }],
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{ type: "text", text: otp }],
              },
            ],
          },
        };
      } else {
        payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: e164,
          type: "text",
          text: {
            preview_url: false,
            body: `🙏 જય સ્વામિનારાયણ!\n\nYour HariSumiran verification code is: *${otp}*.\n\nValid for 5 minutes. Please do not share this OTP with anyone.\n\n— Shree Swaminarayan Mandir, HariPrabodham`,
          },
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[WhatsApp Cloud API Error]:", data);
        return {
          success: false,
          error: data.error?.message || "Meta WhatsApp Cloud API failed to dispatch",
          details: data,
        };
      }

      console.log(`[WhatsApp Cloud API Success] OTP sent to +${e164}:`, data);
      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (err: any) {
      console.error("[WhatsApp Cloud API Exception]:", err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Dev mode fallback when credentials are not yet set
  console.log(`\n======================================================`);
  console.log(`[WhatsApp OTP Dev Mode] Meta Cloud API credentials not configured.`);
  console.log(`📲 Dispatched WhatsApp OTP to +${e164}: [ ${otp} ]`);
  console.log(`======================================================\n`);

  return {
    success: true,
    isDevMode: true,
    message: `WhatsApp OTP generated in dev mode: ${otp}`,
  };
}
