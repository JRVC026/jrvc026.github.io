const content = document.getElementById('content');

function fetchTextFile(file) {
    return fetch(file)
        .then(response => response.text())
        .then(text => text.trim());
}

function writeTextFile(file, text) {
    return fetch(file, {
        method: 'PUT',
        body: text,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}

function deleteTextFile(file) {
    return fetch(file, { method: 'DELETE' });
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hour = padZero(date.getHours());
    const minute = padZero(date.getMinutes());
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${days}d ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

function updateTimer(releaseDate) {
    const countdownElem = document.querySelector('.countdown');
    const now = new Date();
    
    if (now >= releaseDate) {
        clearInterval(timerInterval);
        content.innerHTML = `
            <p>Congratulations! You are Free!</p>
            <button id="reset">Start Again!</button>
        `;
        document.getElementById('reset').addEventListener('click', resetTimer);
        return;
    }
    
    const timeLeft = Math.round((releaseDate - now) / 1000);
    
    countdownElem.textContent = formatTime(timeLeft);
}

function startTimer() {    Promise.all([
        fetchTextFile('min.txt'),
        fetchTextFile('max.txt'),
        fetchTextFile('cur.txt')
    ]).then(([minDateText, maxDateText, curDateText]) => {
        const minDate = new Date(minDateText);
        const maxDate = new Date(maxDateText);
        let curDate = new Date(curDateText);
        
        const now = new Date();
        
        if (now >= curDate) {
            const timePassed = now - curDate;
            curDate = new Date(now.getTime() + timePassed);
            writeTextFile('cur.txt', curDate.toISOString());
        }
        
        if (curDate - now <= 3600000 && maxDate - now >= 3600000) {
            const hoursLeft = Math.round((maxDate - now) / 3600000);
            const hoursToAdd = Math.floor(Math.random() * hoursLeft);
            curDate = new Date(now.getTime() + hoursToAdd * 3600000);
            writeTextFile('cur.txt', curDate.toISOString());
        }
        
        if (maxDate - curDate <= 10800000) {
            curDate = maxDate;
            writeTextFile('cur.txt', curDate.toISOString());
        }
        
        content.innerHTML = `
            <div class="countdown"></div>
            <div class="release-date">
                Countdown Until Release:<br>
                ${formatDate(curDate)}
            </div>
            <div class="release-date">
                Initial Release Date/Time:<br>
                ${formatDate(minDate)}
            </div>
            <div class="release-date">
                Latest Release Date/Time:<br>
                ${formatDate(maxDate)}
            </div>
        `;
        
        timerInterval = setInterval(() => updateTimer(curDate), 1000);
    });
}

function resetTimer() {
    Promise.all([
        deleteTextFile('min.txt'),
        deleteTextFile('max.txt'),
        deleteTextFile('cur.txt')
    ]).then(() => location.reload());
}

function validateInput() {
    const minInput = document.getElementById('min-input');
    const maxInput = document.getElementById('max-input');
    const beginButton = document.getElementById('begin');
    
    const min = parseInt(minInput.value, 10);
    const max = parseInt(maxInput.value, 10);
    
    if (isNaN(min) || isNaN(max) || min >= max) {
        beginButton.disabled = true;
    } else {
        beginButton.disabled = false;
    }
}

function startCountdown() {
    const minInput = document.getElementById('min-input');
    const maxInput = document.getElementById('max-input');
    
    const minHours = parseInt(minInput.value, 10);
    const maxHours = parseInt(maxInput.value, 10);
    
    const now = new Date();
    
    const minReleaseTime = now.getTime() + minHours * 3600000;
    const maxReleaseTime = now.getTime() + maxHours * 3600000;
    
    Promise.all([
        writeTextFile('min.txt', new Date(minReleaseTime).toISOString()),
        writeTextFile('max.txt', new Date(maxReleaseTime).toISOString()),
        writeTextFile('cur.txt', new Date(minReleaseTime).toISOString())
    ]).then(() => location.reload());
}

let timerInterval;

fetchTextFile('cur.txt').then(curDateText => {
    if (curDateText) {
        startTimer();
    } else {
        content.innerHTML = `
            <label>
                Minimum Hours:
                <input type="number" id="min-input" min="1" max="999" required>
            </label><br><br>
            <label>
                Maximum Hours:
                <input type="number" id="max-input" min="1" max="999" required>
            </label><br><br>
            <button id="begin" disabled>Begin</button>
        `;
        
        document.getElementById('min-input').addEventListener('input', validateInput);
        document.getElementById('max-input').addEventListener('input', validateInput);
        
        document.getElementById('begin').addEventListener('click', startCountdown);
    }
});
