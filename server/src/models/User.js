import { get, all, run, insert } from './database.js';
import bcrypt from 'bcryptjs';
import { game } from '../config/index.js';

export const User = {
    // 创建用户
    create(username, password) {
        const hashedPassword = bcrypt.hashSync(password, 10);

        // 插入用户并获取ID
        const userId = insert(
            `INSERT INTO users (username, password, coins) VALUES (?, ?, ?)`,
            [username, hashedPassword, game.initialCoins]
        );

        console.log('创建用户成功, userId:', userId);

        // 为新用户创建初始地块
        for (let i = 0; i < game.initialPlots; i++) {
            insert(`INSERT INTO plots (user_id, plot_index) VALUES (?, ?)`, [userId, i]);
        }

        console.log('创建地块成功, 共', game.initialPlots, '块');

        return userId;
    },

    // 根据用户名查找
    findByUsername(username) {
        return get('SELECT * FROM users WHERE username = ?', [username]);
    },

    // 根据ID查找
    findById(id) {
        return get('SELECT id, username, coins, level, exp, created_at FROM users WHERE id = ?', [id]);
    },

    // 验证密码
    verifyPassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    },

    // 更新金币
    updateCoins(userId, amount) {
        return run('UPDATE users SET coins = coins + ? WHERE id = ?', [amount, userId]);
    },

    // 更新经验和等级
    addExp(userId, expAmount) {
        const user = this.findById(userId);
        let newExp = user.exp + expAmount;
        let newLevel = user.level;

        // 检查是否升级
        while (newExp >= newLevel * game.levelExpBase) {
            newExp -= newLevel * game.levelExpBase;
            newLevel++;
        }

        return run('UPDATE users SET exp = ?, level = ? WHERE id = ?', [newExp, newLevel, userId]);
    },

    // 搜索用户（用于添加好友）
    search(keyword, excludeUserId) {
        return all(
            `SELECT id, username, level FROM users WHERE username LIKE ? AND id != ? LIMIT 10`,
            [`%${keyword}%`, excludeUserId]
        );
    }
};
