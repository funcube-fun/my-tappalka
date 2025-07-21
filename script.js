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
let dailyBonusStreak = 0;
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
let tapBoostActive = false;
let tapBoostEndTime = 0;
let walletConnected = false;
let walletAddress = '';

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
        dailyBonusStreak = data.dailyBonusStreak || 0;
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
        tapBoostActive = data.tapBoostActive || false;
        tapBoostEndTime = data.tapBoostEndTime || 0;
        walletConnected = data.walletConnected || false;
        walletAddress = data.walletAddress || '';
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
        dailyBonusStreak,
        level,
        exp,
        referralClaimed,
        taskVideoCompleted,
        taskTelegram1Completed,
        taskTelegram2Completed,
        taskTelegram3Completed,
        taskYoutubeCompleted,
        taskTiktokCompleted,
        upgradesToday,
        tapBoostActive,
        tapBoostEndTime,
        walletConnected,
        walletAddress
    };
    localStorage.setItem('ukraineCoinGame', JSON.stringify(gameData));
}

function calculateLevelReward(level) {
    return 100 + (level - 1) * 400;
}

function calculateDailyBonus(day) {
    return (day + 1) * 10000;
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
    document.getElementById('tap-boost-btn').disabled = score < 500 || tapBoostActive;
    document.getElementById('energy-boost-btn').disabled = score < 300 || energy >= maxEnergy;

    // Update daily bonus buttons
    const canClaim = Date.now() - lastDailyBonusTime >= dailyBonusCooldown;
    const currentDay = canClaim ? dailyBonusStreak : dailyBonusStreak - 1;
    for (let i = 0; i < 30; i++) {
        const btn = document.getElementById(`daily-bonus-day${i + 1}-btn`);
        const reward = calculateDailyBonus(i);
        btn.innerHTML = `📄 День ${i + 1}: +${reward.toLocaleString()}`;
        btn.disabled = i !== currentDay || !canClaim;
        btn.classList.remove('completed', 'current', 'locked', 'unavailable');
        if (i < currentDay) {
            btn.classList.add('completed');
        } else if (i === currentDay && canClaim) {
            btn.classList.add('current');
        } else if (i === currentDay && !canClaim) {
            btn.classList.add('unavailable');
        } else {
            btn.classList.add('locked');
        }
    }

    document.getElementById('referral-btn').disabled = referralClaimed;
    document.getElementById('task-video-btn').disabled = taskVideoCompleted;
    document.getElementById('task-telegram1-btn').disabled = taskTelegram1Completed;
    document.getElementById('task-telegram2-btn').disabled = taskTelegram2Completed;
    document.getElementById('task-telegram3-btn').disabled = taskTelegram3Completed;
    document.getElementById('task-youtube-btn').disabled = taskYoutubeCompleted;
    document.getElementById('task-tiktok-btn').disabled = taskTiktokCompleted;

    // Update wallet status
    document.getElementById('wallet-status').textContent = walletConnected ? `Підключено: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Кошелек не підключено';
    document.getElementById('connect-wallet-btn').textContent = walletConnected ? 'Відключити кошелек 🦊' : 'Підключити кошелек 🦊';
    document.getElementById('connect-wallet-btn').disabled = false;

    saveGame();
}

function tapCoin(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    if (energy >= 1) {
        const currentProfit = tapBoostActive ? profitPerTap * 2 : profitPerTap;
        score += currentProfit;
        energy -= 1;
        exp += Math.floor(currentProfit * 10);
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
    anim.textContent = `+${Math.floor(tapBoostActive ? profitPerTap * 2 : profitPerTap)}`;
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

function activateTapBoost(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    if (score >= 500 && !tapBoostActive) {
        score -= 500;
        tapBoostActive = true;
        tapBoostEndTime = Date.now() + 30 * 1000; // 30 seconds
        showNotification('Тап буст активовано! Заробіток x2 на 30 секунд!');
        setTimeout(() => {
            tapBoostActive = false;
            showNotification('Тап буст закінчився!');
            updateDisplay();
        }, 30 * 1000);
        updateDisplay();
    } else {
        showNotification(tapBoostActive ? 'Тап буст уже активний!' : 'Недостатньо монет!');
    }
}

function activateEnergyBoost(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    if (score >= 300 && energy < maxEnergy) {
        score -= 300;
        energy = maxEnergy;
        showNotification('Енергію повністю відновлено!');
        updateDisplay();
    } else {
        showNotification(energy >= maxEnergy ? 'Енергія вже повна!' : 'Недостатньо монет!');
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

function claimDailyBonus(day, event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();
    const currentTime = Date.now();
    const canClaim = currentTime - lastDailyBonusTime >= dailyBonusCooldown;
    const currentDay = canClaim ? dailyBonusStreak : dailyBonusStreak - 1;

    if (day !== currentDay || !canClaim) {
        showNotification('Неможливо отримати цей бонус зараз!');
        return;
    }

    const lastClaimDate = new Date(lastDailyBonusTime);
    const currentDate = new Date(currentTime);
    const isSameDay = lastClaimDate.getFullYear() === currentDate.getFullYear() &&
                      lastClaimDate.getMonth() === currentDate.getMonth() &&
                      lastClaimDate.getDate() === currentDate.getDate();
    const isYesterday = lastClaimDate.getFullYear() === currentDate.getFullYear() &&
                        lastClaimDate.getMonth() === currentDate.getMonth() &&
                        lastClaimDate.getDate() === currentDate.getDate() - 1;

    if (!isSameDay && !isYesterday && lastDailyBonusTime !== 0) {
        dailyBonusStreak = 0;
    }

    dailyBonusStreak = isSameDay ? dailyBonusStreak : dailyBonusStreak + 1;
    const bonus = calculateDailyBonus(dailyBonusStreak - 1);
    score += bonus;
    exp += 2000;
    lastDailyBonusTime = currentTime;
    if (dailyBonusStreak >= 30) {
        dailyBonusStreak = 0;
        showNotification(`Вітаємо! +${bonus.toLocaleString()} монет за ${dailyBonusStreak} день! Серію завершено!`);
    } else {
        showNotification(`День ${dailyBonusStreak}: +${bonus.toLocaleString()} монет!`);
    }
    checkLevelUp();
    updateDisplay();
}

function connectWallet(event) {
    event.preventDefault();
    if (Date.now() - lastEventTime < 100) return;
    lastEventTime = Date.now();

    if (walletConnected) {
        // Disconnect wallet
        walletConnected = false;
        walletAddress = '';
        showNotification('Кошелек відключено!');
        updateDisplay();
    } else {
        // Simulate wallet connection
        if (window.Telegram && window.Telegram.WebApp) {
            // Attempt to use Telegram Web App's wallet integration (if available)
            try {
                window.Telegram.WebApp.requestWalletAuth((result) => {
                    if (result && result.address) {
                        walletConnected = true;
                        walletAddress = result.address;
                        showNotification(`Кошелек підключено: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
                        updateDisplay();
                    } else {
                        showNotification('Не вдалося підключити кошелек. Спробуйте ще раз.');
                    }
                });
            } catch (e) {
                // Fallback to simulated wallet connection
                walletConnected = true;
                walletAddress = '0x' + Math.random().toString(16).slice(2, 42);
                showNotification(`Кошелек підключено: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
                updateDisplay();
            }
        } else {
            // Simulate wallet connection for non-Telegram environment
            walletConnected = true;
            walletAddress = '0x' + Math.random().toString(16).slice(2, 42);
            showNotification(`Кошелек підключено: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
            updateDisplay();
        }
    }
}

function openTab(tabName, event) {
    event.preventDefault();
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    document.getElementById(`${tabName}-content`).classList.add('active');
    event.currentTarget.classList.add('active');
    updateDisplay();
}

function regenerateEnergy() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    if (deltaTime > 0) {
        energy = Math.min(energy + deltaTime * energyRegenRate, maxEnergy);
        score += passiveIncome * (deltaTime / 3600);
        exp += Math.floor(passiveIncome * (deltaTime / 3600) * 10);
        checkLevelUp();
        if (tapBoostActive && currentTime >= tapBoostEndTime) {
            tapBoostActive = false;
            showNotification('Тап буст закінчився!');
        }
    }
    lastTime = currentTime;
    updateDisplay();
    requestAnimationFrame(regenerateEnergy);
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
    } else {
        console.warn('Not running in Telegram Web App environment');
    }

    loadGame();
    regenerateEnergy();
});
