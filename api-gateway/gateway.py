import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

MIDTERM_API_BASE = os.getenv("MIDTERM_API_BASE", "https://mobile-provider-api-vfpp.onrender.com/api/v1")
TEST_JWT = os.getenv("TEST_JWT") 

@app.route('/api/v1/gateway/chat', methods=['POST'])
def chat():
    data = request.get_json()
    print("Gelen veri:", data)

    intent = data.get("intent")
    subscriber_no = data.get("subscriber_no")
    month = data.get("month")

    if not (intent and subscriber_no and month):
        return jsonify({"error": "Missing intent or parameters!"}), 400

    headers = {"Authorization": f"Bearer {TEST_JWT}"}

    # GET BILL
    if intent == "get_bill":
        resp = requests.get(
            f"{MIDTERM_API_BASE}/pay-bill/bill",
            params={"subscriber_no": subscriber_no, "month": month},
            headers=headers
        )
        try:
            return jsonify(resp.json()), resp.status_code
        except Exception as e:
            return jsonify({"error": "Midterm backend'den response alınamadı.", "details": str(e)}), 500

    # GET BILL DETAILS
    elif intent == "get_bill_details":
        page = data.get("page", 1)
        page_size = data.get("page_size", 10)
        resp = requests.get(
            f"{MIDTERM_API_BASE}/pay-bill/bill/details",
            params={
                "subscriber_no": subscriber_no,
                "month": month,
                "page": page,
                "page_size": page_size
            },
            headers=headers
        )
        try:
            return jsonify(resp.json()), resp.status_code
        except Exception as e:
            return jsonify({"error": "Midterm backend'den response alınamadı.", "details": str(e)}), 500

    # PAY BILL
    elif intent == "pay_bill":
        resp = requests.post(
            f"{MIDTERM_API_BASE}/pay-bill",
            json={
                "subscriber_no": subscriber_no,
                "month": month
            },
            headers=headers
        )
        try:
            return jsonify(resp.json()), resp.status_code
        except Exception as e:
            return jsonify({"error": "Midterm backend'den response alınamadı.", "details": str(e)}), 500

    return jsonify({"error": f"Unhandled intent: {intent}"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
