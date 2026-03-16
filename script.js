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

const MAX_CHARS_PER_LINE = 6; // 한 줄에 들어갈 최대 글자 수 (조절 가능)

areas.forEach(area => {
    area.addEventListener("input", (e) => {
        const textLength = area.value.length;

        if (textLength > 15){
            area.style.fontSize = "0.9em";
        } else if (textLength > 10){
            area.style.fontSize = "1.0em";
        } else {
            area.style.fontSize = "1.1em";
        }
        
        let content = area.value;
        
        // 1. 자동 줄바꿈 로직 (음보 단위)
        // 줄바꿈을 제거한 상태에서 단어별로 분리
        let words = content.replace(/\n/g, "").split(" ");
        let newContent = "";
        let currentLineLength = 0;

        for (let i = 0; i < words.length; i++) {
            if (currentLineLength + words[i].length > MAX_CHARS_PER_LINE) {
                newContent += "\n" + words[i] + " ";
                currentLineLength = words[i].length + 1;
            } else {
                newContent += words[i] + " ";
                currentLineLength += words[i].length + 1;
            }
        }

        // 입력 중인 내용 업데이트 (커서 위치 유지를 위해 값이 다를 때만 업데이트)
        if (area.value !== newContent.trimEnd()) {
            area.value = newContent.trimEnd();
        }

        // 2. 기존 저장 로직 유지
        const id = area.dataset.id;
        localStorage.setItem(`goal_${getFormattedDate()}_${id}`, area.value);
    });
});

// 화면 크기에 맞춰 전체 박스를 축소하는 함수 (기존 fitToScreen 활용)
function fitToScreen() {
    const content = document.getElementById('scalable-content');
    const wrapper = document.getElementById('main-wrapper');
    
    if (!content || !wrapper) return;

    const scaleX = wrapper.offsetWidth / (content.offsetWidth + 20);
    const scaleY = wrapper.offsetHeight / (content.offsetHeight + 20);
    
    const minScale = Math.min(scaleX, scaleY, 1); 
    
    // 박스 자체가 줄어들면 내부 텍스트(em 단위)도 같은 비율로 시각적 축소됨
    content.style.transform = `scale(${minScale})`;
}

window.addEventListener('resize', fitToScreen);
window.addEventListener('load', fitToScreen);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

/* 키워드 불러오기 */

mainAreas.forEach(area=>{

const id = area.dataset.id;

area.value = localStorage.getItem(`goal_${dateKey}_${id}`) || "";

});

/* 설명 불러오기 */

subAreas.forEach(area=>{

const id = area.dataset.sub;

area.value = localStorage.getItem(`goalSub_${dateKey}_${id}`) || "";

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

mainAreas.forEach(area=>{

area.addEventListener("input",()=>{

const id = area.dataset.id;
const dateKey = formatDate(currentDate);

localStorage.setItem(`goal_${dateKey}_${id}`,area.value);

});

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
