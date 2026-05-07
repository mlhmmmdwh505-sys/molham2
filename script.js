let allScores = [];

const screen = document.getElementById('game-screen'),
      mainText = document.getElementById('main-text'),
      subText = document.getElementById('sub-text'),
      icon = document.getElementById('icon'),
      highScoreDisplay = document.getElementById('high-score'),
      historyList = document.getElementById('history-list');

let startTime, timeoutId, state = 'START';
let highScore = localStorage.getItem('best') || null;

if(highScore) highScoreDisplay.innerText = highScore;

// 1. دالة تحديد الرتبة بناءً على السرعة
function getRank(ms) {
    if (ms < 200) return "🔥 أسطوري ";
    if (ms < 250) return "⚡ سريع جداً ";
    if (ms < 300) return "🚀 محترف ";
    if (ms < 400) return "🐢 متوسط ";
    return "😴 بطيء ";
}

screen.addEventListener('pointerdown', () => {
    if (state === 'START' || state === 'RESULT') {
        state = 'WAITING';
        screen.className = 'state-waiting';
        icon.innerText = '✋';
        mainText.innerText = 'انتظر...';
        subText.innerText = 'لا تضغط حتى يتغير اللون للأخضر';
        
        // وقت عشوائي بين 2 إلى 5 ثواني
        timeoutId = setTimeout(() => {
            state = 'GO';
            screen.className = 'state-go';
            icon.innerText = '🚀';
            mainText.innerText = 'اضغط الآن!';
            startTime = performance.now();
        }, Math.random() * 8000 + 2000);
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
    
    // حفظ النتيجة في المصفوفة لحساب المتوسط
    allScores.push(score);
    
    // حساب متوسط نتائج اللاعب
    const avgScore = Math.round(allScores.reduce((a, b) => a + b) / allScores.length);
    document.getElementById('current-avg').innerText = avgScore;

    const rank = getRank(score);
    mainText.innerText = `${score} ms`;
    
    // إضافة مقارنة مع المتوسط الطبيعي في النص الفرعي
    const diff = score - 250;
    const comparison = diff <= 0 ? "أسرع من الطبيعي!" : "أبطأ من الطبيعي";
    subText.innerHTML = `رتبتك: ${rank} <br> <b>${comparison}</b>`;
    
    // تحديث الأفضل (High Score)
    if(!highScore || score < highScore) {
        highScore = score;
        localStorage.setItem('best', score);
        highScoreDisplay.innerText = score;
    }

    // إضافة النتيجة للقائمة
    const li = document.createElement('li');
    li.innerText = score + 'ms';
    historyList.prepend(li);
    if(historyList.children.length > 5) historyList.lastChild.remove();
}
    }
);
