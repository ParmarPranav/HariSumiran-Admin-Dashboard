import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { getFCM } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientPhone,
      recipientRole,
      alertType = "sabha", // "sabha" | "thal_2_days" | "thal_1_day" | "thal_today" | "general"
      customTitle,
      customSubtitle,
      customLocation,
      customTime,
      captainPhone,
      familyName,
    } = body;

    let badge = "🕉️ સાપ્તાહિક સભા • SABHA DAY";
    let title = "આજે સાપ્તાહિક રવિસભા છે";
    let subtitle = "Weekly Youth Satsang Sabha • Nadiad Mandir";
    let tagline = "સત્સંગ, કથા-વાર્તા અને દિવ્ય સાનિધ્યનો અનેરો લાભ";
    let category = "SATSANG SABHA";
    let categoryIcon = "temple";
    let scheduledTime = "સાંજે ૫:૩૦ થી ૭:૩૦";
    let location = "હરિપ્રબોધમ, નડીઆદ મંદિર (મુખ્ય સભાખંડ)";
    let actionDoneText = "✓ હા, હું આવીશ";
    let snoozeLabel = "૩૦ મિ. યાદ";
    let snoozeMinutes = "30";
    let actionSkipText = "સભા વિગત";
    let targetRoute = "/calendar";

    if (alertType === "thal_2_days") {
      badge = "🌾 આગોતરી યાદી • T-2 DAYS ADVANCE";
      title = "તમારી થાળ સેવા ૨ દિવસમાં છે";
      subtitle = "Thal Preparation & Grocery Check";
      tagline = "રસોઈ સામગ્રી અને કરિયાણાની સમયસર ચકાસણી કરી લેવી";
      category = "THAL SEVA";
      categoryIcon = "soup_kitchen";
      scheduledTime = customTime || "તારીખ: ૨૦ નવેમ્બર ૨૦૨૬";
      location = "હરિપ્રબોધમ નડીઆદ મંદિર રસૉડું";
      actionDoneText = "✓ સેવા સ્વીકારો";
      snoozeLabel = "સાંજે યાદ";
      snoozeMinutes = "120";
      actionSkipText = "મેનુ જુઓ";
      targetRoute = "/kitchen-recipe";
    } else if (alertType === "thal_1_day") {
      badge = "⚠️ આવતીકાલે સેવા • TOMORROW'S SEVA";
      title = "આવતીકાલે તમારી થાળ સેવા છે";
      subtitle = "Cook & Captain Coordination";
      tagline = "મુખ્ય રસોઈયા તથા કેપ્ટન સાથે સમય અને મેનુ કન્ફર્મ કરો";
      category = "THAL SEVA";
      categoryIcon = "dinner_dining";
      scheduledTime = "આવતીકાલે સવારે";
      location = "નડીઆદ મંદિર ભોજનાલય";
      actionDoneText = "📞 કૉલ કેપ્ટન";
      snoozeLabel = "૨ કલાક બાદ";
      snoozeMinutes = "60";
      actionSkipText = "બદલી વિનંતી";
      targetRoute = "/my-responsibilities";
    } else if (alertType === "thal_today") {
      badge = "🔔 અતિ મહત્વપૂર્ણ • TODAY'S THAL SEVA";
      title = "આજે તમારી થાળ સેવા છે!";
      subtitle = "Mandir Delivery Deadline: 10:30 AM";
      tagline = "ઠાકોરજીના ભોગ માટે ૧૦:૩૦ વાગ્યા સુધીમાં મંદિરે પહોંચાડવો";
      category = "THAL SEVA URGENT";
      categoryIcon = "alarm_on";
      scheduledTime = customTime || "૧૦:૩૦ AM પૂર્વે";
      location = "હરિપ્રબોધમ નડીઆદ મંદિર રસૉડું";
      actionDoneText = "🚗 નીકળી ગયા";
      snoozeLabel = "૧૫ મિ. યાદ";
      snoozeMinutes = "15";
      actionSkipText = "સહાય / કૉલ";
      targetRoute = "/kitchen-recipe";
    }

    if (customTitle) title = customTitle;
    if (customSubtitle) subtitle = customSubtitle;
    if (customLocation) location = customLocation;
    if (customTime) scheduledTime = customTime;

    await connectDB();

    // Query recipient users
    const query: any = {};
    if (recipientPhone) {
      const cleanPhone = recipientPhone.toString().replace(/\D/g, "");
      query.phone = { $regex: cleanPhone.slice(-10) + "$" };
    } else if (recipientRole) {
      query.role = recipientRole;
    }

    const users = await User.find(query);
    const alertId = `ALERT-${Date.now()}`;

    const tokens: string[] = [];
    users.forEach((u) => {
      if (u.deviceTokens && u.deviceTokens.length > 0) {
        u.deviceTokens.forEach((dt) => {
          if (dt.token && !tokens.includes(dt.token)) {
            tokens.push(dt.token);
          }
        });
      }
    });

    const fullScreenPayload = {
      type: "full_screen_alert",
      alertType,
      alertId,
      badge,
      title,
      subtitle,
      tagline,
      category,
      categoryIcon,
      scheduledTime,
      location,
      actionDoneText,
      snoozeLabel,
      snoozeDurationMinutes: snoozeMinutes,
      actionSkipText,
      targetRoute,
      captainPhone: captainPhone || "9825000000",
      familyName: familyName || "",
    };

    // If FCM is configured and active, multicast immediately
    const fcm = getFCM();
    let multicastSuccess = false;
    let successCount = 0;
    if (fcm && tokens.length > 0) {
      try {
        const fcmRes = await fcm.sendEachForMulticast({
          tokens,
          notification: {
            title,
            body: `${subtitle} • ${scheduledTime}`,
          },
          data: fullScreenPayload,
          android: {
            priority: "high",
            notification: {
              channelId: "hari_sumiran_urgent_fullscreen",
              priority: "max",
              defaultSound: true,
              defaultVibrateTimings: true,
            },
          },
        });
        successCount = fcmRes.successCount;
        multicastSuccess = successCount > 0;
      } catch (fcmErr) {
        console.warn("[UrgentAlert FCM dispatch warning]:", fcmErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Dispatched ${alertType} alert to ${tokens.length} device tokens (Sent: ${successCount})`,
      alertId,
      recipientCount: users.length,
      deviceTokensCount: tokens.length,
      multicastSuccess,
      payload: fullScreenPayload,
    });
  } catch (error: any) {
    console.error("[Urgent FullScreen Alert Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
