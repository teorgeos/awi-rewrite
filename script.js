// 공용 엘리먼트
const inputEl   = document.getElementById("messageInput");
const sendBtn   = document.getElementById("sendBtn");
const list1El   = document.getElementById("messageList");   // index.html
const list2El   = document.getElementById("displayList");   // display.html

// 안전하게 리스트에 추가
function addRow(ul, text, ts) {
  if (!ul) return;
  const li  = document.createElement("li");
  const msg = document.createElement("div"); msg.textContent = text;
  const meta= document.createElement("div"); meta.className="meta";
  meta.textContent = ts ? `시간: ${ts}` : "";
  li.append(msg, meta);
  ul.prepend(li);
}

// === 1) 입력 페이지 동작 (index.html에만 버튼/인풋 있음) ===
if (sendBtn && inputEl) {
  sendBtn.addEventListener("click", async () => {
    const text = (inputEl.value || "").trim();
    if (!text) return;
    sendBtn.disabled = true;
    try {
      await firebase.firestore().collection("sentences").add({
        text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      inputEl.value = "";
      inputEl.focus();
    } finally {
      setTimeout(() => (sendBtn.disabled = false), 150);
    }
  });
}

// 두 페이지 공통: 항상 구독하고, 있는 리스트에만 그린다
const ref = firebase.firestore()
  .collection("sentences")
  .orderBy("createdAt", "asc");

ref.onSnapshot(
  (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type !== "added") return;
      const d  = change.doc.data();
      const ts = d.createdAt?.toDate
        ? d.createdAt.toDate().toLocaleString("ko-KR")
        : "";
      if (list1El) addRow(list1El, d.text || "", ts); // index.html
      if (list2El) addRow(list2El, d.text || "", ts); // display.html
    });
  },
  (err) => console.error("onSnapshot error:", err)
);



// 프론트엔드 관련 코드들

