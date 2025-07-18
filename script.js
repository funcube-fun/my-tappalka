let score = parseInt(localStorage.getItem('score')) || 0;
let profitPerTap = parseInt(localStorage.getItem('profitPerTap')) || 1;
let profitLevel = parseInt(localStorage.getItem('profitLevel')) || 1;
let miningLevel = parseInt(localStorage.getItem('miningLevel')) || 1;
let energyLevel = parseInt(localStorage.getItem('energyLevel')) || 1;
let regenLevel = parseInt(localStorage.getItem('regenLevel')) || 1;
let energy = parseInt(localStorage.getItem('energy')) || 100;
let maxEnergy = parseInt(localStorage.getItem('maxEnergy')) || 100;
let energyRegenRate = parseFloat(localStorage.getItem('energyRegenRate')) || 0.5;
let passiveIncome = parseInt(localStorage.getItem('passiveIncome')) || 0;
let totalTaps = parseInt(localStorage.getItem('totalTaps')) || 0;
let lastTime = parseInt(localStorage.getItem('lastTime')) || Date.now();
let lastDailyBonusTime = parseInt(localStorage.getItem('lastDailyBonusTime')) || 0;
const dailyBonusCooldown = 24 * 60 * 60 * 1000;
let level = parseInt(localStorage.getItem('level')) || 1;
let exp = parseInt(localStorage.getItem('exp')) || 0;
let baseExpToLevel = 1000;
let expToLevel = baseExpToLevel * level;

function calculateLevelReward(level) {
    return 100 + (level - 1) * 400;
}

function saveGame() {
    localStorage.setItem('score', Math.floor(score));
    localStorage.setItem('profitPerTap', profitPerTap);
    localStorage.setItem('profitLevel', profitLevel);
    localStorage.setItem('miningLevel', miningLevel);
    localStorage.setItem('energyLevel', energyLevel);
    localStorage.setItem('regenLevel', regenLevel);
    localStorage.setItem('energy', Math.floor(energy));
    localStorage.setItem('maxEnergy', maxEnergy);
    localStorage.setItem('energyRegenRate', energyRegenRate);
    localStorage.setItem('passiveIncome', passiveIncome);
    localStorage.setItem('totalTaps', totalTaps);
    localStorage.setItem('lastTime', lastTime);
    localStorage.setItem('lastDailyBonusTime', lastDailyBonusTime);
    localStorage.setItem('level', level);
    localStorage.setItem('exp', exp);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

function updateDisplay() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('profit').textContent = `+${Math.floor(profitPerTap)}`;
    document.getElementById('profit-hour').textContent = `+${Math.floor(passiveIncome)}`;
    document.getElementById('energy').textContent = `${Math.floor(energy)}/${maxEnergy}`;
    document.getElementById('level').textContent = level;
    document.getElementById('progress-fill').style.width = `${(exp / expToLevel) * 100}%`;
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
    document.getElementById('referral-btn').disabled = localStorage.getItem('referralClaimed') === 'true';
    document.getElementById('task-video-btn').disabled = localStorage.getItem('task_video_completed') === 'true';
    document.getElementById('task-telegram1-btn').disabled = localStorage.getItem('task_telegram1_completed') === 'true';
    document.getElementById('task-telegram2-btn').disabled = localStorage.getItem('task_telegram2_completed') === 'true';
    document.getElementById('task-telegram3-btn').disabled = localStorage.getItem('task_telegram3_completed') === 'true';
    document.getElementById('task-youtube-btn').disabled = localStorage.getItem('task_youtube_completed') === 'true';
    document.getElementById('task-tiktok-btn').disabled = localStorage.getItem('task_tiktok_completed') === 'true';
    saveGame();
}

function handleEvent(event, callback) {
    event.preventDefault();
    if (Date.now() - (event.timeStamp || 0) < 100) return;
    callback();
}

function tapCoin(event) {
    handleEvent(event, () => {
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
        }
    });
}

function createTapAnimation(event) {
    const anim = document.createElement('div');
    anim.className = 'tap-animation';
    anim.textContent = `+${Math.floor(profitPerTap)}`;
    anim.style.left = `${event.offsetX - 20}px`;
    anim.style.top = `${event.offsetY - 20}px`;
    document.getElementById('hamster-image').appendChild(anim);
    setTimeout(() => anim.remove(), 500);
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
    handleEvent(event, () => {
        const cost = 50 * profitLevel;
        if (score >= cost) {
            score -= cost;
            profitLevel++;
            profitPerTap += 2;
            localStorage.setItem('upgradesToday', (parseInt(localStorage.getItem('upgradesToday')) || 0) + 1);
            showNotification('Тап покращено!');
            updateDisplay();
        } else {
            showNotification('Недостатньо монет!');
        }
    });
}

function upgradeMining(event) {
    handleEvent(event, () => {
        const cost = 100 * miningLevel;
        if (score >= cost) {
            score -= cost;
            miningLevel++;
            passiveIncome += 50;
            localStorage.setItem('upgradesToday', (parseInt(localStorage.getItem('upgradesToday')) || 0) + 1);
            showNotification('Шахта покращена!');
            updateDisplay();
        } else {
            showNotification('Недостатньо монет!');
        }
    });
}

function upgradeEnergy(event) {
    handleEvent(event, () => {
        const cost = 200 * energyLevel;
        if (score >= cost) {
            score -= cost;
            energyLevel++;
            maxEnergy += 20;
            energy = maxEnergy;
            localStorage.setItem('upgradesToday', (parseInt(localStorage.getItem('upgradesToday')) || 0) + 1);
            showNotification('Максимальна енергія збільшена!');
            updateDisplay();
        } else {
            showNotification('Недостатньо монет!');
        }
    });
}

function upgradeRegen(event) {
    handleEvent(event, () => {
        const cost = 300 * regenLevel;
        if (score >= cost) {
            score -= cost;
            regenLevel++;
            energyRegenRate += 0.5;
            localStorage.setItem('upgradesToday', (parseInt(localStorage.getItem('upgradesToday')) || 0) + 1);
            showNotification('Регенерація прискорена!');
            updateDisplay();
        } else {
            showNotification('Недостатньо монет!');
        }
    });
}

function showReferral(event) {
    handleEvent(event, () => {
        if (!localStorage.getItem('referralClaimed')) {
            score += 100;
            exp += 1000;
            checkLevelUp();
            localStorage.setItem('referralClaimed', 'true');
            showNotification('Реферальний бонус використано! +100 монет!');
            updateDisplay();
        } else {
            showNotification('Реферальний бонус уже використано!');
        }
    });
}

function completeTask(taskType, event) {
    handleEvent(event, () => {
        if (!localStorage.getItem(`task_${taskType}_completed`)) {
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
            checkLevelUp();
            localStorage.setItem(`task_${taskType}_completed`, 'true');
            showNotification(`Завдання виконано! +${reward} монет!`);
            updateDisplay();
        } else {
            showNotification('Завдання вже виконано!');
        }
    });
}

function claimDailyBonus(event) {
    handleEvent(event, () => {
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
    });
}

function makeDonation(event) {
    handleEvent(event, () => {
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
    });
}

function openTab(tabName, event) {
    handleEvent(event, () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
    });
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
    updateDisplay();
    regenerateEnergy();
    if (Date.now() - lastDailyBonusTime >= dailyBonusCooldown) lastDailyBonusTime = Date.now() - (Date.now() % (24 * 60 * 60 * 1000));
});
