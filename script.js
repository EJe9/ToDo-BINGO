const mainAreas = document.querySelectorAll(".goalMain");
const subAreas = document.querySelectorAll(".goalSub");
const checks = document.querySelectorAll("input[type='checkbox']");

const dateLabel = document.getElementById("currentDate");
const prevBtn = document.getElementById("prevDay");
const nextBtn = document.getElementById("nextDay");

const bingoEffect = document.getElementById("bingoEffect");
const bingoCountLabel = document.getElementById("bingoCount");

const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function autoScale() {
  const canvas = document.getElementById('bingo-app-canvas');
  const wrapper = document.getElementById('app-wrapper');

  // 화면 너비와 박스 너비의 비율 계산
  const scale = Math.min(window.innerWidth / 700, 1); 

  // transform 적용
  canvas.style.transform = `scale(${scale})`;
}

// 1. 창 크기 변경 시 실행
window.addEventListener('resize', autoScale);

// 2. 처음 로딩 시 실행
window.onload = autoScale;

let currentDate = new Date();

/* 빙고 라인 */

const bingoLines = [
[0,1,2],
[3,4,5],
[6,7,8],
[0,3,6],
[1,4,7],
[2,5,8],
[0,4,8],
[2,4,6]
];

let completedBingos = new Set();

/* 날짜 문자열 */

function formatDate(date){

const y = date.getFullYear();
const m = String(date.getMonth()+1).padStart(2,"0");
const d = String(date.getDate()).padStart(2,"0");

return `${y}-${m}-${d}`;

}

/* 보드 불러오기 */

function loadBoard(){

const dateKey = formatDate(currentDate);

/* 빙고 불러오기 */

const savedBingo = localStorage.getItem(`bingo_${dateKey}`);

completedBingos = savedBingo
? new Set(JSON.parse(savedBingo))
: new Set();

/* 오늘 표시 */

const today = new Date();
const todayKey = formatDate(today);

dateLabel.textContent = (dateKey === todayKey) ? "오늘" : dateKey;

/* 자동 저장 */

const allAreas = document.querySelectorAll(".goalMain, .goalSub");

allAreas.forEach(area => {

  const id = area.dataset.id;
  const type = area.classList.contains("goalMain") ? "main" : "sub";

  const dateKey = formatDate(currentDate);
  const storageKey = `goal_${type}_${dateKey}_${id}`;

  /* 불러오기 */
  area.value = localStorage.getItem(storageKey) || "";

  /* 자동 저장 */
  area.addEventListener("input", () => {

    const dateKey = formatDate(currentDate);

    localStorage.setItem(
      `goal_${type}_${dateKey}_${id}`,
      area.value
    );

  });

});
/* 체크 상태 */

checks.forEach(check=>{

const id = check.dataset.check;

const saved = localStorage.getItem(`check_${dateKey}_${id}`);

const box = check.closest(".box");

if(saved==="true"){

check.checked=true;
box.classList.add("completed");

}else{

check.checked=false;
box.classList.remove("completed");

}

});

/* 빙고 표시 업데이트 */

updateBingoCount();

/* 현재 상태 기반 빙고 검사 */

checkBingo(false);

}

/* 키워드 저장 */

const allAreas = document.querySelectorAll(".goalMain, .goalSub");

allAreas.forEach(area => {

  const id = area.dataset.id;
  const type = area.classList.contains("goalMain") ? "main" : "sub";

  const dateKey = formatDate(currentDate);

  area.value = localStorage.getItem(
    `goal_${type}_${dateKey}_${id}`
  ) || "";

});

/* 설명 저장 */

subAreas.forEach(area=>{

area.addEventListener("input",()=>{

const id = area.dataset.sub;
const dateKey = formatDate(currentDate);

localStorage.setItem(`goalSub_${dateKey}_${id}`,area.value);

});

});

/* 체크 저장 */

checks.forEach(check=>{

check.addEventListener("change",()=>{

const id = check.dataset.check;
const dateKey = formatDate(currentDate);

localStorage.setItem(`check_${dateKey}_${id}`,check.checked);

const box = check.closest(".box");

if(check.checked){
box.classList.add("completed");
}else{
box.classList.remove("completed");
}

checkBingo(true);

});

});

/* 빙고 검사 */

function checkBingo(showEffect){

const checked = [...checks].map(c=>c.checked);
const dateKey = formatDate(currentDate);

let newBingos = new Set();

bingoLines.forEach((line,index)=>{

if(line.every(i=>checked[i])){
newBingos.add(index);
}

});

/* 새로 생긴 빙고 */

let newCreated = [...newBingos].filter(i=>!completedBingos.has(i));

completedBingos = newBingos;

localStorage.setItem(
`bingo_${dateKey}`,
JSON.stringify([...completedBingos])
);

updateBingoCount();

if(showEffect && newCreated.length>0){
showBingo();
}

}

/* 빙고 개수 표시 */

function updateBingoCount(){

const count = completedBingos.size;

bingoCountLabel.textContent = `${count} BINGO`;

}

/* 빙고 이펙트 */

function showBingo(){

const count = completedBingos.size;

let text = "BINGO!";

if(count === 2){
text = "2 BINGO!";
}
else if(count === 3){
text = "3 BINGO!";
}
else if(count >= 4){
text = "PERFECT BINGO!";
}

bingoEffect.textContent = text;

bingoEffect.classList.add("show");

createConfetti();

setTimeout(()=>{
bingoEffect.classList.remove("show");
},1200);

}

/* confetti */

let confetti = [];
let confettiStartTime = 0;

const colors = [
"#ff5252",
"#ff9800",
"#ffeb3b",
"#4caf50",
"#2196f3",
"#9c27b0",
"#e91e63",
"#00bcd4"
];

function createConfetti(){

confetti = [];
confettiStartTime = Date.now();

for(let i=0;i<160;i++){

confetti.push({

x:Math.random()*canvas.width,
y:-20,

size:6+Math.random()*8,
speed:2+Math.random()*4,

angle:Math.random()*360,

color:colors[Math.floor(Math.random()*colors.length)],

opacity:1

});

}

animateConfetti();

}

function animateConfetti(){

ctx.clearRect(0,0,canvas.width,canvas.height);

const elapsed = Date.now() - confettiStartTime;

confetti.forEach(p=>{

p.y += p.speed;
p.angle += 6;

if(elapsed > 2000){
p.opacity -= 0.03;
}

ctx.save();

ctx.globalAlpha = Math.max(p.opacity,0);

ctx.translate(p.x,p.y);
ctx.rotate(p.angle*Math.PI/180);

ctx.fillStyle = p.color;

ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);

ctx.restore();

});

confetti = confetti.filter(p=>p.opacity > 0 && p.y < canvas.height+20);

if(confetti.length > 0){
requestAnimationFrame(animateConfetti);
}else{
ctx.clearRect(0,0,canvas.width,canvas.height);
}

}

/* 날짜 이동 */

prevBtn.onclick = ()=>{

currentDate.setDate(currentDate.getDate()-1);
loadBoard();

};

nextBtn.onclick = ()=>{

currentDate.setDate(currentDate.getDate()+1);
loadBoard();

};

/* 더블클릭 → 오늘 */

dateLabel.addEventListener("dblclick",()=>{

currentDate = new Date();
loadBoard();

});

/* 시작 */

loadBoard();

function resizeCanvas(){

  const wrapper = document.getElementById("app-wrapper");
  const rect = wrapper.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
