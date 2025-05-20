import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const MESSAGES_COLLECTION = "messages";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

useEffect(() => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy("timestamp", "asc")
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const msgs = [];
    querySnapshot.forEach((doc) => {
      msgs.push({ id: doc.id, ...doc.data() });
    });
    setMessages(msgs);
    // Burası fonksiyonun içinde olmalı:
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });
  return () => unsubscribe();
}, []);


  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await addDoc(collection(db, MESSAGES_COLLECTION), {
      text: input,
      sender: "user",
      timestamp: serverTimestamp(),
    });
    setInput("");
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 16 }}>
      <h2>AI Billing Assistant</h2>
      <div
        style={{
          minHeight: 300,
          maxHeight: 400,
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          background: "#f6f6f6",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontWeight: msg.sender === "user" ? "bold" : "normal",
                color: msg.sender === "user" ? "#1573ff" : "#222",
                textAlign: msg.sender === "user" ? "right" : "left",
              }}
            >
              {msg.text}
            </div>
            {msg.response && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: 8,
                  marginTop: 5,
                  textAlign: "left",
                  fontSize: 15,
                  color: "#24650a"
                }}
              >
                {typeof msg.response === "object"
                  ? <pre>{JSON.stringify(msg.response, null, 2)}</pre>
                  : msg.response}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
        <input
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #bbb",
          }}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            background: "#1573ff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
