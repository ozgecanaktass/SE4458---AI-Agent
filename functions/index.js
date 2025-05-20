require('dotenv').config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");


admin.initializeApp();
const db = admin.firestore();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GATEWAY_API_URL = process.env.GATEWAY_API_URL;


exports.onMessageCreated = functions.firestore
  .document("messages/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const text = data.text;
    const sender = data.sender;
    const docId = context.params.docId;


    if (sender !== "user") {
      console.log("Yalnızca user mesajları işlenir.");
      return;
    }

    console.log("Yeni mesaj:", text);

    // OpenAI ile intent parse et
    let intent_data = null;
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: (
                "You are an assistant that extracts billing-related intent and parameters from user queries.\n" +
                "You MUST respond ONLY with a JSON object in the following exact format:\n" +
                '{"intent": one of ["get_bill", "get_bill_details", "pay_bill"], "subscriber_no": string, "month": YYYY-MM}.\n' +
                "The month parameter MUST always be output as 'YYYY-MM' (e.g., 2025-03). " +
                "If the user says a month like 'March 2025', convert it to '2025-03'. " +
                'If the message is ambiguous or irrelevant, choose "intent": "get_bill" by default.\n' +
                "Respond with pure JSON only. Do not include any explanation, notes, or text."
              )
            },
            {
              role: "user",
              content: text
            }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      const raw = response.data.choices[0].message.content;
      console.log("Intent raw:", raw);
      intent_data = JSON.parse(raw);
    } catch (e) {
      console.log("OpenAI intent parse hatası:", e.message);
      intent_data = { error: e.message };
    }

    // Gateway'e POST isteği at
    let answer;
    if (intent_data && !intent_data.error) {
      try {
        const r = await axios.post(GATEWAY_API_URL, intent_data, { timeout: 20000 });
        answer = r.data;
        console.log("Gateway cevabı:", answer);
      } catch (e) {
        answer = { error: `Gateway isteğinde hata: ${e.message}` };
      }
    } else {
      answer = { error: `Intent parse hatası: ${intent_data.error}` };
    }

    // Firestore'a cevabı yaz
    await db.collection("messages").doc(docId).update({
      response: answer
    });
    console.log("✅ Gateway cevabı Firestore'a yazıldı!");
  });
