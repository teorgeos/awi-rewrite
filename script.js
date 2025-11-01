// 공용 엘리먼트
const inputEl   = document.getElementById("messageInput"); //display.html
const sendBtn   = document.getElementById("sendBtn"); //display.html
const list1El   = document.getElementById("messageList");   // index.html
const list2El   = document.getElementById("displayList");   // display.html

const overlayEl       = document.getElementById("cardOverlay");
const overlayInnerEl  = overlayEl ? overlayEl.querySelector(".overlay-inner") : null;
const overlayMsgEl    = document.getElementById("overlayMsg");
const overlayMetaEl   = document.getElementById("overlayMeta");
const overlayCloseBtn = document.getElementById("overlayCloseBtn");

function openOverlay(fromCardEl) {
  if (!overlayEl || !overlayInnerEl || !overlayMsgEl || !overlayMetaEl) return;

  // 카드 안의 요소들
  const msgEl  = fromCardEl.querySelector(".msg");
  const metaEl = fromCardEl.querySelector(".meta");

  const msgText  = msgEl?.textContent || "";
  const metaText = metaEl?.textContent || "";

  // 1) 텍스트 넣기
  overlayMsgEl.textContent  = msgText;
  overlayMetaEl.textContent = metaText;

  // 2) 기존에 남아있던 폰트 클래스 제거
  //    (sunflower-light, dokdo-regular 같은 애들 싹 지우고 새로 세팅)
  overlayMsgEl.classList.remove(
    "sunflower-light",
    "poor-story-regular",
    "dokdo-regular",
    "east-sea-dokdo-regular",
    "gaegu-regular",
    "gowun-batang-regular"
  );

  // 3) 현재 카드의 msg가 가진 폰트 클래스를 그대로 복사
  if (msgEl) {
    FONT_CLASSES.forEach(cls => {
      if (msgEl.classList.contains(cls)) {
        overlayMsgEl.classList.add(cls);
      }
    });
  }

  // 4) 배경 종이 이미지도 그대로 복사
  const bgImg = fromCardEl.style.backgroundImage;
  overlayInnerEl.style.backgroundImage = bgImg || "none";

  // 5) 팝업 열기
  overlayEl.style.display = "flex";
}


// 닫기
if (overlayCloseBtn && overlayEl) {
  overlayCloseBtn.addEventListener("click", () => {
    overlayEl.style.display = "none";
  });
}
// 오버레이 검은 영역 클릭해도 닫히게 (안 원하면 이 부분 지워)
if (overlayEl) {
  overlayEl.addEventListener("click", (e) => {
    // 바깥(overlayEl 자체)을 클릭한 경우만 닫기
    if (e.target === overlayEl) {
      overlayEl.style.display = "none";
    }
  });
}

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

  // 텍스처 후보
  const papers = [
    "img/paper1.png", "img/paper2.png", "img/paper3.png", "img/paper4.png", 
    "img/paper5.png", "img/paper6.png", "img/paper7.png", "img/paper8.png", 
    "img/paper9.png", "img/paper10.png", "img/paper11.png", "img/paper12.png"
  ];
  const pick = () => papers[Math.floor(Math.random() * papers.length)];

  // DOM 만들기
  const li   = document.createElement('li');
  const msg  = document.createElement('div');
  const meta = document.createElement('div');

  li.className   = 'paper-card';
  msg.className  = 'msg';
  meta.className = 'meta';

  // 폰트 번갈아 쓰기
  const fontIdx = Number(ul.dataset.fontIdx || 0);
  msg.classList.add(FONT_CLASSES[fontIdx]);
  ul.dataset.fontIdx = (fontIdx + 1) % FONT_CLASSES.length;

  msg.textContent  = text;
  meta.textContent = ts ? `시간: ${ts}` : '';

  li.append(msg, meta);
  ul.appendChild(li); // 먼저 붙여야 크기 계산 가능

  // 랜덤 폭
  const minW = 160;
  const maxW = 400;
  const w = Math.floor(Math.random() * (maxW - minW) + minW);
  li.style.width = w + 'px';

  // 세로 제한
  const maxH = Math.max(240, Math.floor(window.innerHeight * 0.6));
  li.style.maxHeight = maxH + 'px';
  li.style.overflow = 'hidden';

  // 랜덤 텍스처 & 회전
  li.style.backgroundImage = `url('${pick()}')`;
  const deg = (Math.random() * 70) - 35; // -35 ~ +35도
  li.style.transform = `rotate(${deg}deg)`;

  // 컨테이너(.board-wrapper 안의 ul) 크기 기준 랜덤 위치
    // 5) 위치 랜덤 (보드 중앙 기준으로 흩뿌리기)
  const containerRect = ul.getBoundingClientRect();

  const liRect = li.getBoundingClientRect();
  const cardW = liRect.width;
  const cardH = Math.min(liRect.height || 260, maxH);

  // 보드 중심 좌표(카드의 left/top은 카드의 좌상단 기준이라 보정 필요)
  const boardW = containerRect.width;
  const boardH = containerRect.height;

  const centerX = boardW / 2 - cardW / 2;
  const centerY = boardH / 2 - cardH / 2;

  // 퍼짐 반경 (값 키우면 더 흩어진다)
  const spreadX = boardW * 0.45; // 전체의 90% 폭 안에서만 뿌리자
  const spreadY = boardH * 0.45; // 전체의 90% 높이 안에서만 뿌리자

  // -1 ~ 1 사이 균등 난수
  function randUnit() {
    return (Math.random() * 2 - 1);
  }

  // 좌우/상하로 튕겨 나가게
  let left = centerX + randUnit() * spreadX;
  let top  = centerY + randUnit() * spreadY;

  // 보드 밖으로 잘리는 건 막기 (안전하게 20px 여백 안에서만)
  const pad = 20;
  const minLeft = pad;
  const maxLeft = boardW - cardW - pad;
  const minTop  = pad;
  const maxTop  = boardH - cardH - pad;

  if (left < minLeft) left = minLeft;
  if (left > maxLeft) left = maxLeft;
  if (top  < minTop)  top  = minTop;
  if (top  > maxTop)  top  = maxTop;

  li.style.left = left + 'px';
  li.style.top  = top  + 'px';


  // z-index 최신 카드가 위
  const currentTop = Number(ul.dataset.zTop || 1);
  li.style.zIndex = currentTop + 1;
  ul.dataset.zTop = String(currentTop + 1);

  // ===== 팝업 열기 이벤트 =====
  li.addEventListener("click", () => {
    openOverlay(li);
  });
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

