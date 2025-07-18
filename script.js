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
let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || ['default'];
let tapBoost = parseFloat(localStorage.getItem('tapBoost')) || 1.0;
let clan = localStorage.getItem('clan') || null;
let minigameScore = 0;

const achievementsList = [
    { id: 'first-tap', name: 'Перший тап', reward: 50, achieved: false },
    { id: '100-taps', name: '100 тапів', reward: 200, achieved: false },
    { id: 'level-5', name: 'Рівень 5', reward: 500, achieved: false },
    { id: '1000-coins', name: '1000 монет', reward: 1000, achieved: false }
];

const dailyMissions = [
    { id: 'tap-50', name: '50 тапів', reward: 100, completed: false, progress: 0, target: 50 },
    { id: 'upgrade-1', name: '1 покращення', reward: 150, completed: false, progress: 0, target: 1 },
    { id: 'daily-bonus', name: 'Взяти бонус', reward: 200, completed: false }
];

function calculateLevelReward(level) {
    return 100 + (level - 1) * 400;
}

function saveGame() {
    localStorage.setItem('score', Math.floor(score));
    localStorage.setItem('profitPerTap', profitPerTap);
    localStorage.setItem('energy', Math.floor(energy));
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
    localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
    localStorage.setItem('tapBoost', tapBoost);
    localStorage.setItem('clan', clan);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

function updateDisplay() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('profit').textContent = `+${Math.floor(profitPerTap * tapBoost)}`;
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
    document.getElementById('buy-skin1-btn').disabled = score < 500 || ownedSkins.includes('skin1');
    document.getElementById('buy-skin2-btn').disabled = score < 1000 || ownedSkins.includes('skin2');
    document.getElementById('buy-boost-btn').disabled = score < 200;
    document.getElementById('create-clan-btn').disabled = score < 1000 || clan;
    document.getElementById('clan-info').textContent = clan ? `Ваш клан: ${clan}` : 'Створіть клан!';
    updateAchievements();
    updateMissions();
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
                showNotification(`Досягнення "${ach.name}"! +${ach.reward} монет!`);
            }
        }
        const item = document.createElement('div');
        item.className = 'achievement-item';
        item.textContent = `${ach.name} (${ach.reward} монет) - ${achievements.find(a => a.id === ach.id && a.achieved) ? 'Виконано' : 'Не виконано'}`;
        achieveList.appendChild(item);
    });
}

function updateMissions() {
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = '';
    dailyMissions.forEach(mission => {
        const item = document.createElement('div');
        item.className = 'mission-item';
        if (mission.progress !== undefined) {
            item.textContent = `${mission.name} (${mission.progress}/${mission.target}) - ${mission.completed ? 'Виконано' : 'В процесі'} (+${mission.reward})`;
        } else {
            item.textContent = `${mission.name} - ${mission.completed ? 'Виконано' : 'Не виконано'} (+${mission.reward})`;
        }
        if (!mission.completed) {
            if (mission.id === 'tap-50' && totalTaps >= mission.target) {
                score += mission.reward;
                mission.completed = true;
                showNotification(`Місія "${mission.name}" завершена! +${mission.reward} монет!`);
            }
            if (mission.id === 'upgrade-1' && localStorage.getItem('upgradesToday') >= 1) {
                score += mission.reward;
                mission.completed = true;
                showNotification(`Місія "${mission.name}" завершена! +${mission.reward} монет!`);
            }
            if (mission.id === 'daily-bonus' && Date.now() - lastDailyBonusTime < dailyBonusCooldown && lastDailyBonusTime > 0) {
                score += mission.reward;
                mission.completed = true;
                showNotification(`Місія "${mission.name}" завершена! +${mission.reward} монет!`);
            }
        }
        missionList.appendChild(item);
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
            score += profitPerTap * tapBoost;
            energy -= 1;
            exp += Math.floor(profitPerTap * tapBoost * 10);
            totalTaps += 1;
            dailyMissions.find(m => m.id === 'tap-50').progress = totalTaps;
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
    anim.textContent = `+${Math.floor(profitPerTap * tapBoost)}`;
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
        const cost = 50 * profitPerTap;
        if (score >= cost) {
            score -= cost;
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
        const cost = 100 * (passiveIncome / 10 + 1);
        if (score >= cost) {
            score -= cost;
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
        const cost = 200 * (maxEnergy / 20 - 4);
        if (score >= cost) {
            score -= cost;
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
        const cost = 300 * (energyRegenRate / 0.5);
        if (score >= cost) {
            score -= cost;
            energyRegenRate += 0.5;
            localStorage.setItem('upgradesToday', (parseInt(localStorage.getItem('upgradesToday')) || 0) + 1);
            showNotification('Регенерація прискорена!');
            updateDisplay();
        } else {
            showNotification('Недостатньо монет!');
        }
    });
}

function claimDailyCombo(event) {
    handleEvent(event, () => {
        if (Date.now() - lastComboTime >= comboCooldown) {
            score += 5000000;
            exp += 50000;
            checkLevelUp();
            lastComboTime = Date.now() + (24 * 60 * 60 * 1000 - (Date.now() % (24 * 60 * 60 * 1000)));
            showNotification('Щоденне комбо отримано! +5M монет!');
            updateDisplay();
        } else {
            showNotification('Комбо доступне завтра!');
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
            showNotification(`Реферальний код: ${referralCode}. Поділіться із другом! +100 монет!`);
            updateDisplay();
        } else {
            showNotification('Реферальний бонус уже використано!');
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
            showNotification('Завдання виконано! +60 монет!');
            updateDisplay();
        } else {
            showNotification('Завдання вже виконано або недоступне!');
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

function withdrawTON(event) {
    handleEvent(event, () => {
        if (score >= 1000) {
            score -= 1000;
            tonBalance += 1;
            showNotification('1 TON додано до гаманця! (Симуляція)');
            updateDisplay();
        } else {
            showNotification('Недостатньо монет для виведення!');
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

function buySkin(skin, cost, event) {
    handleEvent(event, () => {
        if (score >= cost && !ownedSkins.includes(skin)) {
            score -= cost;
            ownedSkins.push(skin);
            showNotification(`Куплено ${skin === 'skin1' ? 'Скін 1' : 'Скін 2'}!`);
            updateDisplay();
            document.getElementById('skin-select').value = skin;
            changeSkin({ target: { value: skin } });
        } else {
            showNotification('Недостатньо монет або шкіра вже куплена!');
        }
    });
}

function buyBoost(cost, event) {
    handleEvent(event, () => {
        if (score >= cost) {
            score -= cost;
            tapBoost += 0.5;
            showNotification('Буст тапу активовано! +0.5x!');
            updateDisplay();
        } else {
            showNotification('Недостатньо монет!');
        }
    });
}

function createClan(event) {
    handleEvent(event, () => {
        if (score >= 1000 && !clan) {
            const clanName = document.getElementById('clan-name').value;
            if (clanName) {
                score -= 1000;
                clan = clanName;
                showNotification(`Клан "${clanName}" створено!`);
                updateDisplay();
            } else {
                showNotification('Введіть назву клану!');
            }
        } else {
            showNotification('Недостатньо монет або клан уже створено!');
        }
    });
}

function changeSkin(event) {
    const skin = event.target.value;
    if (ownedSkins.includes(skin)) {
        const svg = skin === 'default' ? 
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23ffaa00"><circle cx="50" cy="50" r="40" /><path d="M50 20a10 10 0 00-10 10v20a10 10 0 0010 10h10a10 10 0 0010-10V30a10 10 0 00-10-10z" fill="%23ffffff" /><path d="M45 50h10v10H45z" fill="%23000000" /></svg>' :
            (skin === 'skin1' ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23ff55aa"><circle cx="50" cy="50" r="40" /><path d="M50 20a10 10 0 00-10 10v20a10 10 0 0010 10h10a10 10 0 0010-10V30a10 10 0 00-10-10z" fill="%23ffffff" /><path d="M45 50h10v10H45z" fill="%2300ff00" /></svg>' :
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2355aaff"><circle cx="50" cy="50" r="40" /><path d="M50 20a10 10 0 00-10 10v20a10 10 0 0010 10h10a10 10 0 0010-10V30a10 10 0 00-10-10z" fill="%23ffaa00" /><path d="M45 50h10v10H45z" fill="%23ffffff" /></svg>');
        document.getElementById('hamster-image').style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
        showNotification(`Скін змінено на ${skin === 'default' ? 'Стандартний' : skin === 'skin1' ? 'Скін 1' : 'Скін 2'}!`);
    } else {
        showNotification('Цей шкін не куплено!');
        document.getElementById('skin-select').value = ownedSkins[0];
        changeSkin({ target: { value: ownedSkins[0] } });
    }
}

function startMinigame(event) {
    handleEvent(event, () => {
        const canvas = document.getElementById('minigame-canvas');
        const ctx = canvas.getContext('2d');
        let gameRunning = true;
        minigameScore = 0;

        function draw() {
            if (!gameRunning) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 10, 0, Math.PI * 2);
            ctx.fill();
            minigameScore++;
            document.getElementById('minigame-score').textContent = minigameScore;
            if (minigameScore < 20) requestAnimationFrame(draw);
            else {
                gameRunning = false;
                score += minigameScore * 10;
                exp += minigameScore * 100;
                checkLevelUp();
                showNotification(`Міні-гра завершена! +${minigameScore * 10} монет!`);
                updateDisplay();
            }
        }
        canvas.addEventListener('click', () => {
            if (gameRunning) minigameScore += 5;
        });
        draw();
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
    if (Date.now() - lastComboTime >= comboCooldown) lastComboTime = Date.now() - (Date.now() % (24 * 60 * 60 * 1000));
    if (Date.now() - lastDailyBonusTime >= dailyBonusCooldown) lastDailyBonusTime = Date.now() - (Date.now() % (24 * 60 * 60 * 1000));
    changeSkin({ target: { value: ownedSkins[0] } });
});
