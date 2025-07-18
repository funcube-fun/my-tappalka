let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let profitPerTap = localStorage.getItem('profitPerTap') ? parseInt(localStorage.getItem('profitPerTap')) : 1;
let energy = localStorage.getItem('energy') ? parseInt(localStorage.getItem('energy')) : 100;
let maxEnergy = localStorage.getItem('maxEnergy') ? parseInt(localStorage.getItem('maxEnergy')) : 100;
let energyRegenRate = localStorage.getItem('energyRegenRate') ? parseFloat(localStorage.getItem('energyRegenRate')) : 0.5;
let totalTaps = localStorage.getItem('totalTaps') ? parseInt(localStorage.getItem('totalTaps')) : 0;
let lastTime = Date.now();
let lastBonusTime = localStorage.getItem('lastBonusTime') ? parseInt(localStorage.getItem('lastBonusTime')) : 0;
let lastSpecialBonusTime = localStorage.getItem('lastSpecialBonusTime') ? parseInt(localStorage.getItem('lastSpecialBonusTime')) : 0;
let lastWeeklyBonusTime = localStorage.getItem('lastWeeklyBonusTime') ? parseInt(localStorage.getItem('lastWeeklyBonusTime')) : 0;
const bonusCooldown = 24 * 60 * 60 * 1000;
const specialBonusCooldown = 48 * 60 * 60 * 1000;
const weeklyBonusCooldown = 7 * 24 * 60 * 60 * 1000;
let autoTapEnabled = localStorage.getItem('autoTapEnabled') === 'true';
let autoTapInterval = null;
let autoTapSpeed = localStorage.getItem('autoTapSpeed') ? parseInt(localStorage.getItem('autoTapSpeed')) : 1000;

function saveGame() {
    localStorage.setItem('score', score);
    localStorage.setItem('profitPerTap', profitPerTap);
    localStorage.setItem('energy', energy);
    localStorage.setItem('maxEnergy', maxEnergy);
    localStorage.setItem('energyRegenRate', energyRegenRate);
    localStorage.setItem('totalTaps', totalTaps);
    localStorage.setItem('lastBonusTime', lastBonusTime);
    localStorage.setItem('lastSpecialBonusTime', lastSpecialBonusTime);
    localStorage.setItem('lastWeeklyBonusTime', lastWeeklyBonusTime);
    localStorage.setItem('autoTapEnabled', autoTapEnabled);
    localStorage.setItem('autoTapSpeed', autoTapSpeed);
}

function updateDisplay() {
    document.getElementById('score').textContent = `UkraineCoins: ${Math.floor(score)}`;
    document.getElementById('profit').textContent = `Прибуток за тап: ${profitPerTap}`;
    document.getElementById('energy').textContent = `Енергія: ${Math.floor(energy)}/${maxEnergy}`;
    document.getElementById('total-taps').textContent = `Загальна кількість тапів: ${totalTaps}`;
    document.getElementById('upgrade-btn').disabled = score < 50 * (profitPerTap - 1 + 1);
    document.getElementById('upgrade-energy-btn').disabled = score < 100 * (maxEnergy / 10 - 9);
    document.getElementById('upgrade-regen-btn').disabled = score < 150 * (energyRegenRate - 0.5 + 1);
    document.getElementById('bonus-btn').disabled = Date.now() - lastBonusTime < bonusCooldown;
    document.getElementById('special-bonus-btn').disabled = Date.now() - lastSpecialBonusTime < specialBonusCooldown;
    document.getElementById('weekly-bonus-btn').disabled = Date.now() - lastWeeklyBonusTime < weeklyBonusCooldown;
    document.getElementById('task-friend-btn').disabled = localStorage.getItem('taskFriendCompleted') === 'true';
    document.getElementById('task-video-btn').disabled = localStorage.getItem('taskVideoCompleted') === 'true';
    document.getElementById('auto-tap-btn').disabled = score < 100 || autoTapEnabled;
    saveGame();
}

function tapCoin() {
    if (energy >= 1) {
        score += profitPerTap;
        energy -= 1;
        totalTaps += 1;
        updateDisplay();
    }
}

function upgradeProfit() {
    const upgradeCost = 50 * (profitPerTap - 1 + 1);
    if (score >= upgradeCost) {
        score -= upgradeCost;
        profitPerTap += 2;
        updateDisplay();
    }
}

function upgradeEnergy() {
    const upgradeCost = 100 * (maxEnergy / 10 - 9);
    if (score >= upgradeCost) {
        score -= upgradeCost;
        maxEnergy += 20;
        energy = maxEnergy;
        updateDisplay();
    }
}

function upgradeRegen() {
    const upgradeCost = 150 * (energyRegenRate - 0.5 + 1);
    if (score >= upgradeCost) {
        score -= upgradeCost;
        energyRegenRate += 0.4;
        updateDisplay();
    }
}

function claimBonus() {
    if (Date.now() - lastBonusTime >= bonusCooldown) {
        score += 200;
        lastBonusTime = Date.now();
        updateDisplay();
    }
}

function claimSpecialBonus() {
    if (Date.now() - lastSpecialBonusTime >= specialBonusCooldown) {
        score += 500;
        lastSpecialBonusTime = Date.now();
        updateDisplay();
    }
}

function claimWeeklyBonus() {
    if (Date.now() - lastWeeklyBonusTime >= weeklyBonusCooldown) {
        score += 1000;
        lastWeeklyBonusTime = Date.now();
        updateDisplay();
    }
}

function completeTask(taskType) {
    if (taskType === 'friend' && !localStorage.getItem('taskFriendCompleted')) {
        score += 100;
        localStorage.setItem('taskFriendCompleted', 'true');
    } else if (taskType === 'video' && !localStorage.getItem('taskVideoCompleted')) {
        score += 60;
        localStorage.setItem('taskVideoCompleted', 'true');
    }
    updateDisplay();
}

function toggleAutoTap() {
    if (score >= 100 && !autoTapEnabled) {
        score -= 100;
        autoTapEnabled = true;
        autoTapInterval = setInterval(() => {
            if (energy >= 1) {
                score += profitPerTap;
                energy -= 1;
                totalTaps += 1;
                updateDisplay();
            }
        }, autoTapSpeed);
        updateDisplay();
    }
}

function makeDonation() {
    const amount = parseInt(document.getElementById('donation-amount').value);
    if (amount >= 20) {
        if (confirm(`Підтвердити пожертвування ${amount} грн на підтримку ЗСУ?`)) {
            alert(`Дякуємо за пожертвування ${amount} грн на підтримку ЗСУ! (Симуляція)`);
            score += amount * 3;
            document.getElementById('donation-amount').value = '';
            updateDisplay();
        }
    } else {
        alert('Мінімальна сума пожертвування - 20 грн.');
    }
}

function openTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
}

function regenerateEnergy() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    energy = Math.min(energy + deltaTime * energyRegenRate, maxEnergy);
    lastTime = currentTime;
    updateDisplay();
    requestAnimationFrame(regenerateEnergy);
}

if (autoTapEnabled) {
    autoTapInterval = setInterval(() => {
        if (energy >= 1) {
            score += profitPerTap;
            energy -= 1;
            totalTaps += 1;
            updateDisplay();
        }
    }, autoTapSpeed);
}

updateDisplay();
regenerateEnergy();
