let score = 0;
let profitPerTap = 1;
let profitLevel = 1;
let miningLevel = 1;
let energyLevel = 1;
let regenLevel = 1;
let energy = 100;
let maxEnergy = 100;
let energyRegenRate = 0.5;
let passiveIncome = 0;
let totalTaps = 0;
let lastTime = Date.now();
let lastDailyBonusTime = 0;
const dailyBonusCooldown = 24 * 60 * 60 * 1000;
let level = 1;
let exp = 0;
let baseExpToLevel = 1000;
let expToLevel = baseExpToLevel * level;
let referralClaimed = false;
let taskVideoCompleted = false;
let taskTelegram1Completed = false;
let taskTelegram2Completed = false;
let taskTelegram3Completed = false;
let taskYoutubeCompleted = false;
let taskTiktokCompleted = false;
let upgradesToday = 0;
let lastEventTime = 0;

function loadGame() {
    const savedData = localStorage.getItem('ukraineCoinGame');
    if (savedData) {
        const data = JSON.parse(savedData);
        score = data.score || 0;
        profitPerTap = data.profitPerTap || 1;
        profitLevel = data.profitLevel || 1;
        miningLevel = data.miningLevel || 1;
        energyLevel = data.energyLevel || 1;
        regenLevel = data.regenLevel || 1;
        energy = data.energy !== undefined ? data.energy : 100;
        maxEnergy = data.maxEnergy || 100;
        energyRegenRate = data.energyRegenRate || 0.5;
        passiveIncome = data.passiveIncome || 0;
        totalTaps = data.totalTaps || 0;
        lastTime = data.lastTime || Date.now();
        lastDailyBonusTime = data.lastDailyBonusTime || 0;
        level = data.level || 1;
        exp = data.exp || 0;
        expToLevel = baseExpToLevel * level;
        referralClaimed = data.referralClaimed || false;
        taskVideoCompleted = data.taskVideoCompleted || false;
        taskTelegram1Completed = data.taskTelegram1Completed || false;
        taskTelegram2Completed = data.taskTelegram2Completed || false;
        taskTelegram3Completed = data.taskTelegram3Completed || false;
        taskYoutubeCompleted = data.taskYoutubeCompleted || false;
        taskTiktokCompleted = data.taskTiktokCompleted || false;
        upgradesToday = data.upgradesToday || 0;
    }
    updateDisplay();
}

function saveGame() {
    const gameData = {
        score: Math.floor(score),
        profitPerTap,
        profitLevel,
        miningLevel,
        energyLevel,
        regenLevel,
        energy: Math.floor(energy),
        maxEnergy,
        energyRegenRate,
        passiveIncome,
        totalTaps,
        lastTime,
        lastDailyBonusTime,
        level,
        exp,
        referralClaimed,
        taskVideoCompleted,
        taskTelegram1Completed,
        taskTelegram2Completed,
        taskTelegram3Completed,
        taskYoutubeCompleted,
        taskTiktokCompleted,
        upgradesToday
    };
    localStorage.setItem('ukraineCoinGame', JSON.stringify(gameData));
}

function calculateLevelReward(level) {
    return 100 + (level - 1) * 400;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

function updateDisplay() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('energy').textContent = `${Math.floor(energy)}/${maxEnergy}`;
    document.getElementById('level').textContent = level;
    document.getElementById('progress-fill').style.width = `${(exp / expToLevel) * 100}%`;
    document.getElementById('profit').textContent = `+${Math.floor(profitPerTap)}`;
    document.getElementById('profit-hour').textContent = `+${Math.floor(passiveIncome)}`;
    document.getElementById('profit-level').textContent = profitLevel;
    document.getElementById('profit-upgrade-cost').textContent = `${50 * profitLevel}`;
    document.getElementById('profit-progress').style.width = `${(profitPerTap % 10 / 10) * 100}%`;
    document.getElementById('mining-level').textContent = miningLevel;
    document.getElementById('mining-upgrade-cost').textContent = `${100 * miningLevel}`;
    document.getElementById('mining-progress').style.width = `${(passiveIncome % 50 / 50) * 100}%`;
    document.getElementById('energy-level').textContent = energyLevel;
    document.getElementById('energy-upgrade-cost').textContent = `${200 * energyLevel}`;
    document.getElementById('energy-progress').style.width = `${(maxEnergy % 20 / 20) * 100}%`;
    document.getElementById('regen-level').textContent = regenLevel;
    document.getElementById('regen-upgrade-cost').textContent = `${300 * regenLevel}`;
    document.getElementById('regen-progress').style.width = `${(energyRegenRate % 0.5 / 0.5) * 100}%`;
    document.getElementById('upgrade-profit-btn').disabled = score < 50 * profitLevel;
    document.getElementById('upgrade-mining-btn').disabled = score < 100 * miningLevel;
    document.getElementById('upgrade-energy-btn').disabled = score < 200 * energyLevel;
    document.getElementById('upgrade-regen-btn').disabled = score < 300 * regenLevel;
    document.getElementById('daily-bonus-btn').disabled = Date.now() - lastDailyBonusTime < dailyBonusCooldown;
    document.getElementById('bonus-status').textContent = Date.now() - lastDailyBonusTime < dailyBonusCooldown ? `Оновлення о ${new Date(lastDailyBonusTime + dailyBonusCooldown).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` : 'Готово!';
    document.getElementById('referral-btn').disabled = referralClaimed;
    document.getElementById('task-video-btn').disabled = taskVideoCompleted;
    document.getElementById('task-telegram1-btn').disabled = taskTelegram1Completed;
    document.getElementById('task-telegram2-btn').disabled = taskTelegram2Completed;
    document.getElementById('task-telegram3-btn').disabled = taskTelegram3Completed;
    document.getElementById('task-youtube-btn').disabled = taskYoutubeCompleted;
    document.getElementById('task-tiktok-btn').disabled = taskTiktokCompleted;
    saveGame();
}

function tapCoin(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    if (energy >= 1) {
        score += profitPerTap;
        energy -= 1;
        exp += Math.floor(profitPerTap * 10);
        totalTaps += 1;
        checkLevelUp();
        createTapAnimation(event);
        updateDisplay();
    } else {
        showNotification('Недостатньо енергії!');
        const hamster = document.getElementById('hamster-image');
        hamster.classList.add('no-energy');
        setTimeout(() => hamster.classList.remove('no-energy'), 300);
    }
}

function createTapAnimation(event) {
    const hamster = document.getElementById('hamster-image');
    const anim = document.createElement('div');
    anim.className = 'tap-animation';
    anim.textContent = `+${Math.floor(profitPerTap)}`;
    anim.style.left = `${event.offsetX - 20}px`;
    anim.style.top = `${event.offsetY - 20}px`;
    hamster.appendChild(anim);
    setTimeout(() => anim.remove(), 700);

    // Add particle effects
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = Math.random() * 2 * Math.PI;
        const distance = 20 + Math.random() * 30;
        particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        particle.style.left = `${event.offsetX}px`;
        particle.style.top = `${event.offsetY}px`;
        hamster.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }
}

function checkLevelUp() {
    while (exp >= expToLevel) {
        exp -= expToLevel;
        level++;
        expToLevel = baseExpToLevel * level;
        const reward = calculateLevelReward(level - 1);
        score += reward;
        showNotification(`Рівень ${level} досягнуто! +${reward} UkraineCoins!`);
    }
}

function upgradeProfit(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    const cost = 50 * profitLevel;
    if (score >= cost) {
        score -= cost;
        profitLevel++;
        profitPerTap += 2;
        upgradesToday += 1;
        showNotification('Тап покращено!');
        updateDisplay();
    } else {
        showNotification('Недостатньо монет!');
    }
}

function upgradeMining(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    const cost = 100 * miningLevel;
    if (score >= cost) {
        score -= cost;
        miningLevel++;
        passiveIncome += 50;
        upgradesToday += 1;
        showNotification('Шахта покращена!');
        updateDisplay();
    } else {
        showNotification('Недостатньо монет!');
    }
}

function upgradeEnergy(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    const cost = 200 * energyLevel;
    if (score >= cost) {
        score -= cost;
        energyLevel++;
        maxEnergy += 20;
        energy = Math.min(energy, maxEnergy);
        upgradesToday += 1;
        showNotification('Максимальна енергія збільшена!');
        updateDisplay();
    } else {
        showNotification('Недостатньо монет!');
    }
}

function upgradeRegen(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    const cost = 300 * regenLevel;
    if (score >= cost) {
        score -= cost;
        regenLevel++;
        energyRegenRate += 0.5;
        upgradesToday += 1;
        showNotification('Регенерація прискорена!');
        updateDisplay();
    } else {
        showNotification('Недостатньо монет!');
    }
}

function showReferral(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    if (!referralClaimed) {
        score += 100;
        exp += 1000;
        checkLevelUp();
        referralClaimed = true;
        showNotification('Реферальний бонус використано! +100 монет!');
        updateDisplay();
    } else {
        showNotification('Реферальний бонус уже використано!');
    }
}

function completeTask(taskType, event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    if (taskType === 'video' && !taskVideoCompleted ||
        taskType === 'telegram1' && !taskTelegram1Completed ||
        taskType === 'telegram2' && !taskTelegram2Completed ||
        taskType === 'telegram3' && !taskTelegram3Completed ||
        taskType === 'youtube' && !taskYoutubeCompleted ||
        taskType === 'tiktok' && !taskTiktokCompleted) {
        let reward = 60;
        let url = 'https://t.me/example';
        if (taskType.startsWith('telegram')) {
            reward = 1000;
            url = `https://t.me/example${taskType.replace('telegram', '')}`;
        } else if (taskType === 'youtube') {
            reward = 1000;
            url = 'https://youtube.com/@example';
        } else if (taskType === 'tiktok') {
            reward = 1000;
            url = 'https://tiktok.com/@example';
        }
        window.open(url, '_blank');
        score += reward;
        exp += reward * 10;
        if (taskType === 'video') taskVideoCompleted = true;
        if (taskType === 'telegram1') taskTelegram1Completed = true;
        if (taskType === 'telegram2') taskTelegram2Completed = true;
        if (taskType === 'telegram3') taskTelegram3Completed = true;
        if (taskType === 'youtube') taskYoutubeCompleted = true;
        if (taskType === 'tiktok') taskTiktokCompleted = true;
        checkLevelUp();
        showNotification(`Завдання виконано! +${reward} монет!`);
        updateDisplay();
    } else {
        showNotification('Завдання вже виконано!');
    }
}

function claimDailyBonus(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    if (Date.now() - lastDailyBonusTime >= dailyBonusCooldown) {
        const bonus = 200 + (level * 50);
        score += bonus;
        exp += 2000;
        checkLevelUp();
        lastDailyBonusTime = Date.now() + (24 * 60 * 60 * 1000 - (Date.now() % (24 * 60 * 60 * 1000)));
        showNotification(`Щоденний бонус! +${bonus} монет!`);
        updateDisplay();
    } else {
        showNotification('Бонус доступний завтра!');
    }
}

function makeDonation(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    const amount = parseInt(document.getElementById('donation-amount').value);
    if (amount >= 20) {
        if (confirm(`Підтвердити пожертву ${amount} грн?`)) {
            score += amount * 3;
            exp += amount * 30;
            checkLevelUp();
            showNotification(`Дякуємо за ${amount} грн! +${amount * 3} монет! (Симуляція)`);
            document.getElementById('donation-amount').value = '';
            updateDisplay();
        }
    } else {
        showNotification('Мінімум 20 грн.');
    }
}

function openTab(tabName, event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
}

function regenerateEnergy() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    if (deltaTime > 0) {
        energy = Math.min(energy + deltaTime * energyRegenRate, maxEnergy);
        score += passiveIncome * (deltaTime / 3600);
        exp += Math.floor(passiveIncome * (deltaTime / 3600) * 10);
        checkLevelUp();
    }
    lastTime = currentTime;
    updateDisplay();
    requestAnimationFrame(regenerateEnergy);
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if running in Telegram Web App environment
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
    } else {
        console.warn('Not running in Telegram Web App environment');
    }

    loadGame();
    regenerateEnergy();
});
