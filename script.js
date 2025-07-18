let score = parseInt(localStorage.getItem('score')) || 0;
let profitPerTap = parseInt(localStorage.getItem('profitPerTap')) || 1;
let energy = parseInt(localStorage.getItem('energy')) || 100;
let maxEnergy = parseInt(localStorage.getItem('maxEnergy')) || 100;
let energyRegenRate = parseFloat(localStorage.getItem('energyRegenRate')) || 0.5;
let passiveIncome = parseInt(localStorage.getItem('passiveIncome')) || 0;
let totalTaps = parseInt(localStorage.getItem('totalTaps')) || 0;
let lastTime = parseInt(localStorage.getItem('lastTime')) || Date.now();
let lastComboTime = parseInt(localStorage.getItem('lastComboTime')) || 0;
let lastDailyBonusTime = parseInt(localStorage.getItem('lastDailyBonusTime')) || 0;
const comboCooldown = 24 * 60 * 60 * 1000;
const dailyBonusCooldown = 24 * 60 * 60 * 1000;
let level = parseInt(localStorage.getItem('level')) || 1;
let exp = parseInt(localStorage.getItem('exp')) || 0;
let baseExpToLevel = 1000;
let expToLevel = baseExpToLevel * level;
let tonBalance = parseInt(localStorage.getItem('tonBalance')) || 0;
let referralCode = localStorage.getItem('referralCode') || Math.random().toString(36).substr(2, 9);
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];

const achievementsList = [
    { id: 'first-tap', name: 'Перший тап', reward: 50, achieved: false },
    { id: '100-taps', name: '100 тапів', reward: 200, achieved: false },
    { id: 'level-5', name: 'Рівень 5', reward: 500, achieved: false },
    { id: '1000-coins', name: '1000 монет', reward: 1000, achieved: false }
];

function calculateLevelReward(level) {
    return 100 + (level - 1) * 400;
}

function saveGame() {
    localStorage.setItem('score', score);
    localStorage.setItem('profitPerTap', profitPerTap);
    localStorage.setItem('energy', energy);
    localStorage.setItem('maxEnergy', maxEnergy);
    localStorage.setItem('energyRegenRate', energyRegenRate);
    localStorage.setItem('passiveIncome', passiveIncome);
    localStorage.setItem('totalTaps', totalTaps);
    localStorage.setItem('lastTime', lastTime);
    localStorage.setItem('lastComboTime', lastComboTime);
    localStorage.setItem('lastDailyBonusTime', lastDailyBonusTime);
    localStorage.setItem('level', level);
    localStorage.setItem('exp', exp);
    localStorage.setItem('tonBalance', tonBalance);
    localStorage.setItem('referralCode', referralCode);
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

function updateDisplay() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('profit').textContent = `+${profitPerTap}`;
    document.getElementById('profit-hour').textContent = `+${Math.floor(passiveIncome)}`;
    document.getElementById('energy').textContent = `${Math.floor(energy)}/${maxEnergy}`;
    document.getElementById('level').textContent = level;
    document.getElementById('progress-fill').style.width = `${(exp / expToLevel) * 100}%`;
    document.getElementById('profit-upgrade-cost').textContent = `Ціна: ${50 * profitPerTap}`;
    document.getElementById('mining-upgrade-cost').textContent = `Ціна: ${100 * (passiveIncome / 10 + 1)}`;
    document.getElementById('energy-upgrade-cost').textContent = `Ціна: ${200 * (maxEnergy / 20 - 4)}`;
    document.getElementById('regen-upgrade-cost').textContent = `Ціна: ${300 * (energyRegenRate / 0.5)}`;
    document.getElementById('upgrade-profit-btn').disabled = score < 50 * profitPerTap;
    document.getElementById('upgrade-mining-btn').disabled = score < 100 * (passiveIncome / 10 + 1);
    document.getElementById('upgrade-energy-btn').disabled = score < 200 * (maxEnergy / 20 - 4);
    document.getElementById('upgrade-regen-btn').disabled = score < 300 * (energyRegenRate / 0.5);
    document.getElementById('daily-combo-btn').disabled = Date.now() - lastComboTime < comboCooldown;
    document.getElementById('combo-status').textContent = Date.now() - lastComboTime < comboCooldown ? `Оновлення о ${new Date(lastComboTime + comboCooldown).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` : 'Готово!';
    document.getElementById('daily-bonus-btn').disabled = Date.now() - lastDailyBonusTime < dailyBonusCooldown;
    document.getElementById('bonus-status').textContent = Date.now() - lastDailyBonusTime < dailyBonusCooldown ? `Оновлення о ${new Date(lastDailyBonusTime + dailyBonusCooldown).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` : 'Готово!';
    document.getElementById('withdraw-btn').disabled = score < 1000;
    document.getElementById('ton-balance').textContent = `${tonBalance} TON`;
    document.getElementById('referral-btn').textContent = `Запросити друга (+100) [${referralCode}]`;
    updateAchievements();
    saveGame();
}

function updateAchievements() {
    const achieveList = document.getElementById('achieve-list');
    achieveList.innerHTML = '';
    achievementsList.forEach(ach => {
        const achieved = achievements.find(a => a.id === ach.id && a.achieved);
        if (!achieved) {
            if ((ach.id === 'first-tap' && totalTaps >= 1) ||
                (ach.id === '100-taps' && totalTaps >= 100) ||
                (ach.id === 'level-5' && level >= 5) ||
                (ach.id === '1000-coins' && score >= 1000)) {
                score += ach.reward;
                achievements.push({ id: ach.id, achieved: true, time: Date.now() });
                alert(`Досягнення "${ach.name}" виконано! +${ach.reward} UkraineCoins!`);
            }
        }
        const item = document.createElement('div');
        item.className = 'achievement-item';
        item.textContent = `${ach.name} (${ach.reward} монет) - ${achievements.find(a => a.id === ach.id && a.achieved) ? 'Виконано' : 'Не виконано'}`;
        achieveList.appendChild(item);
    });
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
            exp += profitPerTap * 10;
            totalTaps += 1;
            checkLevelUp();
            createTapAnimation(event);
            updateDisplay();
        }
    });
}

function createTapAnimation(event) {
    const anim = document.createElement('div');
    anim.className = 'tap-animation';
    anim.textContent = `+${profitPerTap}`;
    anim.style.left = `${event.offsetX}px`;
    anim.style.top = `${event.offsetY}px`;
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
        alert(`Рівень ${level} досягнуто! +${reward} UkraineCoins!`);
    }
}

function upgradeProfit(event) {
    handleEvent(event, () => {
        const cost = 50 * profitPerTap;
        if (score >= cost) {
            score -= cost;
            profitPerTap += 2;
            updateDisplay();
        }
    });
}

function upgradeMining(event) {
    handleEvent(event, () => {
        const cost = 100 * (passiveIncome / 10 + 1);
        if (score >= cost) {
            score -= cost;
            passiveIncome += 50;
            updateDisplay();
        }
    });
}

function upgradeEnergy(event) {
    handleEvent(event, () => {
        const cost = 200 * (maxEnergy / 20 - 4);
        if (score >= cost) {
            score -= cost;
            maxEnergy += 20;
            energy = maxEnergy;
            updateDisplay();
        }
    });
}

function upgradeRegen(event) {
    handleEvent(event, () => {
        const cost = 300 * (energyRegenRate / 0.5);
        if (score >= cost) {
            score -= cost;
            energyRegenRate += 0.5;
            updateDisplay();
        }
    });
}

function claimDailyCombo(event) {
    handleEvent(event, () => {
        if (Date.now() - lastComboTime >= comboCooldown) {
            score += 5000000;
            exp += 50000;
            checkLevelUp();
            lastComboTime = Date.now();
            updateDisplay();
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
            alert(`Реферальний код: ${referralCode}. Поділіться із другом!`);
            updateDisplay();
        }
    });
}

function completeTask(taskType, event) {
    handleEvent(event, () => {
        if (taskType === 'video' && !localStorage.getItem('taskVideoCompleted')) {
            score += 60;
            exp += 600;
            checkLevelUp();
            localStorage.setItem('taskVideoCompleted', 'true');
            updateDisplay();
        }
    });
}

function claimDailyBonus(event) {
    handleEvent(event, () => {
        if (Date.now() - lastDailyBonusTime >= dailyBonusCooldown) {
            score += 200 + (level * 50); // Бонус увеличивается с уровнем
            exp += 2000;
            checkLevelUp();
            lastDailyBonusTime = Date.now();
            updateDisplay();
        }
    });
}

function withdrawTON(event) {
    handleEvent(event, () => {
        if (score >= 1000) {
            score -= 1000;
            tonBalance += 1;
            alert('1 TON додано до гаманця! (Симуляція)');
            updateDisplay();
        }
    });
}

function makeDonation(event) {
    handleEvent(event, () => {
        const amount = parseInt(document.getElementById('donation-amount').value);
        if (amount >= 20) {
            if (confirm(`Підтвердити пожертву ${amount} грн?`)) {
                alert(`Дякуємо за ${amount} грн! (Симуляція)`);
                score += amount * 3;
                exp += amount * 30;
                checkLevelUp();
                document.getElementById('donation-amount').value = '';
                updateDisplay();
            }
        } else {
            alert('Мінімум 20 грн.');
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
    energy = Math.min(energy + deltaTime * energyRegenRate, maxEnergy);
    score += passiveIncome * (deltaTime / 3600);
    exp += passiveIncome * (deltaTime / 3600) * 10;
    checkLevelUp();
    lastTime = currentTime;
    updateDisplay();
    requestAnimationFrame(regenerateEnergy);
}

document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    regenerateEnergy();
});
