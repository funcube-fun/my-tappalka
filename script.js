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
let tapBoost = parseFloat(localStorage.getItem('tapBoost')) || 1.0;
let minigameActive = false;
let player = { x: 150, y: 100, speed: 5 };
let enemies = [];
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
    localStorage.setItem('tapBoost', tapBoost);
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
    document.getElementById('buy-boost-btn').disabled = score < 200;
    document.getElementById('achieve-list').innerHTML = '';
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

function claimDailyCombo(event) {
    handleEvent(event, () => {
        showNotification('Функція комбо видалена!');
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

function startMinigame(event) {
    handleEvent(event, () => {
        if (!minigameActive) {
            minigameActive = true;
            const canvas = document.createElement('canvas');
            canvas.id = 'minigame-canvas';
            canvas.width = 300;
            canvas.height = 200;
            canvas.style.border = '2px solid #ffd700';
            canvas.style.borderRadius = '10px';
            canvas.style.background = '#2a2a5a';
            document.getElementById('minigame-content').appendChild(canvas);
            player = { x: 150, y: 100, speed: 5 };
            enemies = [];
            minigameScore = 0;
            document.addEventListener('keydown', movePlayer);
            requestAnimationFrame(gameLoop);
            showNotification('Міні-гра почалась! Керуйте стрілками, уникайте ворогів!');
        }
    });
}

function movePlayer(event) {
    if (minigameActive) {
        switch (event.key) {
            case 'ArrowUp': player.y = Math.max(0, player.y - player.speed); break;
            case 'ArrowDown': player.y = Math.min(200, player.y + player.speed); break;
            case 'ArrowLeft': player.x = Math.max(0, player.x - player.speed); break;
            case 'ArrowRight': player.x = Math.min(300, player.x + player.speed); break;
        }
    }
}

function gameLoop() {
    if (minigameActive) {
        const canvas = document.getElementById('minigame-canvas');
        const ctx = canvas.getContext('2d');

        // Створення ворогів
        if (Math.random() < 0.02) {
            enemies.push({ x: Math.random() * 300, y: -10, speed: 2 + Math.random() * 2 });
        }

        // Оновлення та відображення
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
        ctx.fill();

        enemies = enemies.filter(enemy => {
            enemy.y += enemy.speed;
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
            ctx.fill();

            // Перевірка зіткнень
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) {
                minigameActive = false;
                score += minigameScore * 10;
                exp += minigameScore * 100;
                checkLevelUp();
                showNotification(`Міні-гра завершена! +${minigameScore * 10} монет!`);
                canvas.remove();
                updateDisplay();
                return false;
            }
            return enemy.y < 210;
        });

        minigameScore++;
        document.getElementById('minigame-score').textContent = minigameScore;

        if (minigameActive) requestAnimationFrame(gameLoop);
    }
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
