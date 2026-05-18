let allScores = [];
let reactionHistory = JSON.parse(localStorage.getItem('reactionHistory')) || [];

const screen = document.getElementById('game-screen'),
      mainText = document.getElementById('main-text'),
      subText = document.getElementById('sub-text'),
      icon = document.getElementById('icon'),
      highScoreDisplay = document.getElementById('high-score'),
      usernameInput = document.getElementById('username-input'),
      historyRows = document.getElementById('history-rows');

let startTime, timeoutId, state = 'START';
let highScore = localStorage.getItem('best') || null;

if(highScore) highScoreDisplay.innerText = highScore;

window.onload = () => {
    usernameInput.value = localStorage.getItem('currentPlayer') || "خالد";
    renderHistoryTable();
};

function saveCurrentPlayer() {
    localStorage.setItem('currentPlayer', usernameInput.value.trim() || "متسابق مجهول");
}

function getRank(ms) {
    if (ms < 200) return "🔥 أسطوري ";
    if (ms < 250) return "⚡ سريع جداً ";
    if (ms < 300) return "🚀 محترف ";
    if (ms < 400) return "🐢 متوسط ";
    return "😴 بطيء ";
}

screen.addEventListener('mousedown', () => {
    if (state === 'START' || state === 'RESULT') {
        state = 'WAITING';
        screen.className = 'state-waiting';
        icon.innerText = '✋';
        mainText.innerText = 'انتظر...';
        subText.innerText = 'لا تضغط حتى يتغير اللون للأخضر';
        
        timeoutId = setTimeout(() => {
            state = 'GO';
            screen.className = 'state-go';
            icon.innerText = '🚀';
            mainText.innerText = 'اضغط الآن!';
            startTime = performance.now();
        }, Math.random() * 3000 + 2000);
    } 
    else if (state === 'WAITING') {
        clearTimeout(timeoutId);
        state = 'RESULT';
        screen.className = 'state-error';
        icon.innerText = '⚠️';
        mainText.innerText = 'مبكر جداً!';
        subText.innerText = 'حاول التركيز أكثر.. انقر للبدء ثانية';
        if(navigator.vibrate) navigator.vibrate(150);
    } 
    else if (state === 'GO') {
        const score = Math.round(performance.now() - startTime);
        state = 'RESULT';
        screen.className = 'state-start';
        icon.innerText = '⏱️';
        
        allScores.push(score);
        const avgScore = Math.round(allScores.reduce((a, b) => a + b) / allScores.length);
        document.getElementById('current-avg').innerText = avgScore;

        const rank = getRank(score);
        mainText.innerText = `${score} ms`;
        
        const diff = score - 250;
        const comparison = diff <= 0 ? "أسرع من الطبيعي!" : "أبطأ من الطبيعي";
        subText.innerHTML = `رتبتك: ${rank} <br> <b>${comparison}</b>`;
        
        if(!highScore || score < highScore) {
            highScore = score;
            localStorage.setItem('best', score);
            highScoreDisplay.innerText = score;
        }

        // جلب التاريخ واليوم الحاليين فقط بدون الساعات والدقائق
        const now = new Date();
        const currentDayDate = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const currentPlayerName = usernameInput.value.trim() || "متسابق مجهول";

        reactionHistory.unshift({
            name: currentPlayerName,
            score: score,
            date: currentDayDate
        });

        localStorage.setItem('reactionHistory', JSON.stringify(reactionHistory));
        renderHistoryTable();
    }
});

function renderHistoryTable() {
    historyRows.innerHTML = '';
    const displayList = reactionHistory.slice(0, 10); 
    
    displayList.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><b>${item.name}</b></td>
            <td style="color: #10b981; font-weight: bold;">ms ${item.score}</td>
            <td>${item.date}</td>
        `;
        historyRows.appendChild(row);
    });
}

function clearHistory() {
    if(confirm("هل تريد مسح سجل تطور المتسابقين بالكامل؟")) {
        reactionHistory = [];
        localStorage.removeItem('reactionHistory');
        allScores = [];
        document.getElementById('current-avg').innerText = '0';
        renderHistoryTable();
    }
}
