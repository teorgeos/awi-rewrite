// 공용 엘리먼트
const inputEl   = document.getElementById("messageInput"); //display.html
const sendBtn   = document.getElementById("sendBtn"); //display.html
const list1El   = document.getElementById("messageList");   // index.html
const list2El   = document.getElementById("displayList");   // display.html


const FONT_CLASSES = [
  "sunflower-light",
  "poor-story-regular",
  "dokdo-regular",
  "east-sea-dokdo-regular",
  "gaegu-regular",
  "gowun-batang-regular"
];


// // 안전하게 리스트에 추가
// function addRow(ul, text, ts) {
//   if (!ul) return;
//   const li  = document.createElement("li");
//   const msg = document.createElement("div"); msg.textContent = text;
//   const meta= document.createElement("div"); meta.className="meta";
//   meta.textContent = ts ? `시간: ${ts}` : "";
//   li.append(msg, meta);
//   ul.prepend(li);
// }

// 안전하게 리스트에 추가 (랜덤 위치/회전/크기 + 종이 텍스처)
function addRow(ul, text, ts) {
  if (!ul || !text) return;

  // 1) 종이 텍스처 후보 (프로젝트에 있는 PNG 이름으로 맞춰줘)
  const papers = [
    "img/paper1.png", "img/paper2.png", "img/paper3.png", "img/paper4.png", 
        "img/paper5.png", "img/paper6.png", "img/paper7.png", "img/paper8.png", 
            "img/paper9.png", "img/paper10.png", "img/paper11.png", "img/paper12.png"
  ];
  const pick = () => papers[Math.floor(Math.random()*papers.length)];

  // 2) 엘리먼트 구성
  const li   = document.createElement('li');
  const msg  = document.createElement('div');
  const meta = document.createElement('div');

  li.className = 'paper-card';
  msg.className = 'msg';
  meta.className = 'meta';

  //텍스트
  const fontIdx = Number(ul.dataset.fontIdx || 0);
  msg.classList.add(FONT_CLASSES[fontIdx]);
  ul.dataset.fontIdx = (fontIdx + 1) % FONT_CLASSES.length;



  msg.textContent = text;
  meta.textContent = ts ? `시간: ${ts}` : '';

  li.append(msg, meta);
  ul.appendChild(li); // 먼저 DOM에 붙여야 clientWidth/Height 계산 가능

  // 3) 랜덤 크기 (폭 기준)
  const minW = 160;
  const maxW = 400;
  const w = Math.floor(Math.random()*(maxW - minW) + minW);
  li.style.width = w + 'px';

  // 높이는 내용에 따라 자동; 다만 너무 길면 보드 밖으로 나가므로 max-height로 컷
  const maxH = Math.max(240, Math.floor(window.innerHeight * 0.6));
  li.style.maxHeight = maxH + 'px';
  li.style.overflow = 'hidden';

  // 4) 텍스처/각도 랜덤
  li.style.backgroundImage = `url('${pick()}')`;
  const deg = (Math.random() * 70) - 35; // -35° ~ 35°
  li.style.transform = `rotate(${deg}deg)`;

  // 5) 위치 랜덤 (컨테이너 경계 안)
  const containerRect = ul.getBoundingClientRect();
  // 현재 li의 바운딩은 width만 확정된 상태에서 대략 예측
  const liRect = li.getBoundingClientRect();
  const cardW = liRect.width;
  const cardH = Math.min(liRect.height || 260, maxH); // 초기치 추정

  const pad = 20; // 가장자리 여유
  const maxLeft = Math.max(pad, containerRect.width  - cardW - pad);
  const maxTop  = Math.max(pad, containerRect.height - cardH - pad);

  const left = Math.floor(Math.random() * maxLeft);
  const top  = Math.floor(Math.random() * maxTop);

  li.style.left = left + 'px';
  li.style.top  = top  + 'px';

  // 6) z-index 순서대로 올리기 (최근 것이 위로)
  const currentTop = Number(ul.dataset.zTop || 1);
  li.style.zIndex = currentTop + 1;
  ul.dataset.zTop = String(currentTop + 1);
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


//페이지 수 콘솔에서 찍어보기
$("#flipbook").bind("turned", function (e, page) {
  console.log("현재 페이지:", page);

   if (page === 2) {
    setTimeout(() => {
      startPage2Typing();
    }, 2500); // 여기서 5초 지연
  }

});

// 초기 페이지도 확인하고 싶으면
console.log("초기 현재 페이지:", $("#flipbook").turn("page"));


