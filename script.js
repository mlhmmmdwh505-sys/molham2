let allScores = [];
// جلب سجل التطور المحفوظ أو إنشاء سجل فارغ لو أول مرة
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

// عند فتح الموقع: استرجاع اسم آخر لاعب وعرض جدول التطور
window.onload = () => {
    usernameInput.value = localStorage.getItem('currentPlayer') || "متسابق مجهول";
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

        // --- إضافة النتيجة الحالية مع الاسم، اليوم، والتاريخ، والوقت ---
        const now = new Date();
        const currentDayDate = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
        const currentTime = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const currentPlayerName = usernameInput.value.trim() || "متسابق مجهول";

        // إدخال البيانات في مصفوفة السجل
        reactionHistory.unshift({
            name: currentPlayerName,
            score: score,
            date: currentDayDate,
            time: currentTime
        });

        // الحفظ التلقائي فوراً في كاش المتصفح حتى لو خرجت
        localStorage.setItem('reactionHistory', JSON.stringify(reactionHistory));
        
        // تحديث عرض الجدول فوراً
        renderHistoryTable();
    }
});

// دالة بناء وعرض الجدول التاريخي للمتسابقين
function renderHistoryTable() {
    historyRows.innerHTML = '';
    // عرض آخر 10 محاولات للتطور منعاً لازدحام الشاشة
    const displayList = reactionHistory.slice(0, 10); 
    
    displayList.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><b>${item.name}</b></td>
            <td style="color: #10b981; font-weight: bold;">${item.score} ms</td>
            <td>${item.date}</td>
            <td>${item.time}</td>
        `;
        historyRows.appendChild(row);
    });
}

// دالة لمسح السجل التراكمي إذا أردت تصفيره
function clearHistory() {
    if(confirm("هل تريد مسح سجل تطور المتسابقين بالكامل؟")) {
        reactionHistory = [];
        localStorage.removeItem('reactionHistory');
        allScores = [];
        document.getElementById('current-avg').innerText = '0';
        renderHistoryTable();
    }
}
