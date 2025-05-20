import os
import openai
import requests
import json
from google.cloud import firestore

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GATEWAY_API_URL = os.getenv("GATEWAY_API_URL") 

openai.api_key = OPENAI_API_KEY

def parse_firestore_value(value):
    return value.get("stringValue", "") if value else ""

def on_message_created(event, context):
    try:
        value = event["value"]["fields"]
        text = parse_firestore_value(value.get("text"))
        sender = parse_firestore_value(value.get("sender"))
        doc_id = context.resource.split('/')[-1]

        # Sadece kullanıcı mesajı ise işle
        if sender != "user":
            print("Yalnızca user mesajları işlenir.")
            return

        print(f"🟢 Yeni mesaj: {text}")

        # OpenAI ile intent parse et
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an assistant that extracts billing-related intent and parameters from user queries.\n"
                            "You MUST respond ONLY with a JSON object in the following exact format:\n"
                            "{\"intent\": one of [\"get_bill\", \"get_bill_details\", \"pay_bill\"], "
                            "\"subscriber_no\": string, \"month\": YYYY-MM}.\n"
                            "The month parameter MUST always be output as 'YYYY-MM' (e.g., 2025-03). "
                            "If the user says a month like 'March 2025', convert it to '2025-03'. "
                            "If the message is ambiguous or irrelevant, choose \"intent\": \"get_bill\" by default.\n"
                            "Respond with pure JSON only. Do not include any explanation, notes, or text."
                        )
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ]
            )
            intent_data = response.choices[0].message.content
            print("Intent raw:", intent_data)
            intent_data = json.loads(intent_data)
        except Exception as e:
            print("OpenAI intent parse hatası:", e)
            intent_data = {"error": str(e)}

        # Gateway'e POST isteği at
        if intent_data and "error" not in intent_data:
            try:
                r = requests.post(
                    GATEWAY_API_URL,
                    json=intent_data,
                    timeout=20
                )
                answer = r.json()
                print("Gateway cevabı:", answer)
            except Exception as e:
                answer = {"error": f"Gateway isteğinde hata: {str(e)}"}
        else:
            answer = {"error": f"Intent parse hatası: {intent_data.get('error')}"}

        # Firestore'a cevabı yaz
        db = firestore.Client()
        db.collection("messages").document(doc_id).update({
            "response": answer
        })
        print("✅ Gateway cevabı Firestore'a yazıldı!")

    except Exception as e:
        print("Fonksiyon hata verdi:", e)
