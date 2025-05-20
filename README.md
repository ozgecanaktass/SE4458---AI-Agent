# AI Billing Chat Assistant

AI-powered chat application for real-time querying, viewing, and paying mobile bills via a conversational interface.  
Developed as **Assignment 2** for the SE4458 - Software Architecture course, extending the original Midterm Project.

---

## Project Overview

This project adds an AI chat interface on top of the Mobile Provider Billing API (Midterm Project).  
Users interact with a virtual agent to query, view, and pay bills using natural language.  
It leverages OpenAI for intent extraction, a Flask API gateway for secure routing, and Firebase for real-time messaging.


- **Demo Video:** [GOOGLE DRIVE](https://drive.google.com/drive/folders/1TQag1qZOeIb8xrwzanTGRshjlWI1PP1_?usp=drive_link)

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Chat UI)
- **Backend:**  
  - **Gateway:** Python Flask (API Gateway)
  - **Cloud Functions:** Firebase (Node.js, intent & business logic)
  - **Database:** Firebase Firestore (Real-time)
  - **LLM:** OpenAI GPT-3.5-turbo
  - **Billing API:** Flask + PostgreSQL (Render.com, Midterm Project)
  - **Tunneling:** Ngrok (public access to local gateway)

---

## 📁 Folder Structure
```
.
├── frontend/ # React chat UI
├── functions/ # Firebase Cloud Functions (Node.js)
│ ├── index.js
│ └── package.json
├── gateway/ # Flask API Gateway
│ └── gateway.py
├── .env.example # Example environment variables
├── firebase.json # Firebase Emulator/Deploy config
└── README.md
.
```
---

##  Architecture Flow

1. **User** writes a message in the React chat UI.
2. The message is saved to Firestore (`messages` collection).
3. **Cloud Function** triggers on message creation:
    - Sends the message text to OpenAI (intent & param extraction).
    - Sends result to Gateway (Flask) via REST API.
    - Gateway adds JWT, calls the Midterm Billing API on Render.
    - Receives response, writes it back to Firestore.
4. **Frontend** listens for Firestore updates and shows responses in real time.

---

## Local Setup

### 1. Environment Variables

```bash
git clone https://github.com/yourusername/ai-billing-chat-assistant.git
cd ai-billing-chat-assistant
```

### 2. Clone the Repository
Sample .env:

```bash
OPENAI_API_KEY=sk-xxxx
GATEWAY_API_URL=https://xxxx.ngrok-free.app/api/v1/gateway/chat
TEST_JWT=eyJhbGciOiJIUzI1NiIsIn...
MIDTERM_API_BASE=https://mobile-provider-api-vfpp.onrender.com/api/v1
```

### 3.Install & Start Services
a. Gateway

```bash
cd gateway
pip install -r requirements.txt
python gateway.py
# Start ngrok to expose local gateway:
ngrok http 8000
# Update GATEWAY_API_URL with your new ngrok URL
```

a. Cloud Functions

```bash
cd functions
npm install
firebase emulators:start --only functions,firestore
# or deploy for production: firebase deploy --only functions
```
c. Frontend
```bash
cd frontend
npm install
npm start
```
## Authentication

- All API calls are made with a **test JWT token** for authentication, specified in `.env` file as `TEST_JWT`.
- This token must be generated using the `/api/v1/auth/login` endpoint of the [Midterm API](https://github.com/ozgecanaktass/mobile-provider-api).
- Update your `.env` with a valid token. Tokens expire, so refresh if you encounter 401 errors.


## Supported Chat Intents
| Intent             | Example Message                                               | Description         |
| ------------------ | ------------------------------------------------------------- | ------------------- |
| get\_bill          | "Show my total bill for March 2025"                           | Query total bill    |
| get\_bill\_details | "Show me the bill details for subscriber 33333 for June 2025" | View bill breakdown |
| pay\_bill          | "Pay my bill for March 2025"                                  | Pay the bill        |

---
 
## Known Issues & Notes
- JWT Expiry: Tokens expire, re-login if you get 401.
- Ngrok URL: Ngrok URLs change every session. Update .env and restart backend functions each time.
- 404/401 Errors: Usually due to expired JWT, missing params, or API downtime.
 
---

## 📋 End-to-End System Steps

| Step | Description                                     |
| ---- | ----------------------------------------------- |
| 1    | User sends a message (React Chat UI)            |
| 2    | The message is saved to Firestore               |
| 3    | Cloud Function is triggered                     |
| 4    | Intent and parameters are extracted via OpenAI  |
| 5    | Data is POSTed to the Gateway; JWT is attached  |
| 6    | The Midterm API is called                       |
| 7    | The response is written back to Firestore       |
| 8    | The reply is displayed to the user in real-time |


## Related Projects

- **Midterm Billing API:** [ozgecanaktass/mobile-provider-api](https://github.com/ozgecanaktass/mobile-provider-api)
  - Live Swagger: [https://mobile-provider-api-vfpp.onrender.com/apidocs](https://mobile-provider-api-vfpp.onrender.com/apidocs)

--- 
  👨‍💻 Developed by **Özgecan Aktaş - 21070001019** for SE4458 Assigment 2 - Spring 2025
Instructor: *[Barış Ceyhan]*
