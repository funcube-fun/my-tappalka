const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            score INTEGER,
            profitPerTap INTEGER,
            profitLevel INTEGER,
            miningLevel INTEGER,
            energyLevel INTEGER,
            regenLevel INTEGER,
            energy INTEGER,
            maxEnergy INTEGER,
            energyRegenRate REAL,
            passiveIncome INTEGER,
            totalTaps INTEGER,
            lastTime INTEGER,
            lastDailyBonusTime INTEGER,
            level INTEGER,
            exp INTEGER,
            referralClaimed BOOLEAN,
            taskVideoCompleted BOOLEAN,
            taskTelegram1Completed BOOLEAN,
            taskTelegram2Completed BOOLEAN,
            taskTelegram3Completed BOOLEAN,
            taskYoutubeCompleted BOOLEAN,
            taskTiktokCompleted BOOLEAN,
            upgradesToday INTEGER
        )`);
    }
});

app.get('/api/load/:userId', (req, res) => {
    const { userId } = req.params;
    db.get('SELECT * FROM users WHERE userId = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else if (row) {
            res.json(row);
        } else {
            res.json({
                score: 0,
                profitPerTap: 1,
                profitLevel: 1,
                miningLevel: 1,
                energyLevel: 1,
                regenLevel: 1,
                energy: 100,
                maxEnergy: 100,
                energyRegenRate: 0.5,
                passiveIncome: 0,
                totalTaps: 0,
                lastTime: Date.now(),
                lastDailyBonusTime: 0,
                level: 1,
                exp: 0,
                referralClaimed: false,
                taskVideoCompleted: false,
                taskTelegram1Completed: false,
                taskTelegram2Completed: false,
                taskTelegram3Completed: false,
                taskYoutubeCompleted: false,
                taskTiktokCompleted: false,
                upgradesToday: 0
            });
        }
    });
});

app.post('/api/save', (req, res) => {
    const data = req.body;
    const query = `
        INSERT OR REPLACE INTO users (
            userId, score, profitPerTap, profitLevel, miningLevel, energyLevel, regenLevel,
            energy, maxEnergy, energyRegenRate, passiveIncome, totalTaps, lastTime,
            lastDailyBonusTime, level, exp, referralClaimed, taskVideoCompleted,
            taskTelegram1Completed, taskTelegram2Completed, taskTelegram3Completed,
            taskYoutubeCompleted, taskTiktokCompleted, upgradesToday
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        data.userId, data.score, data.profitPerTap, data.profitLevel, data.miningLevel,
        data.energyLevel, data.regenLevel, data.energy, data.maxEnergy, data.energyRegenRate,
        data.passiveIncome, data.totalTaps, data.lastTime, data.lastDailyBonusTime, data.level,
        data.exp, data.referralClaimed, data.taskVideoCompleted, data.taskTelegram1Completed,
        data.taskTelegram2Completed, data.taskTelegram3Completed, data.taskYoutubeCompleted,
        data.taskTiktokCompleted, data.upgradesToday
    ];
    db.run(query, values, (err) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json({ success: true });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
