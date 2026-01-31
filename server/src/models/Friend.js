import { get, all, run } from './database.js';

export const Friend = {
    // 添加好友（双向）
    add(userId, friendId) {
        run(`INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)`, [userId, friendId]);
        run(`INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)`, [friendId, userId]);
        return true;
    },

    // 获取好友列表
    getList(userId) {
        return all(
            `SELECT u.id, u.username, u.level, f.created_at as friend_since
       FROM friends f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
            [userId]
        );
    },

    // 检查是否为好友
    isFriend(userId, friendId) {
        return !!get(`SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?`, [userId, friendId]);
    },

    // 删除好友（双向）
    remove(userId, friendId) {
        return run(
            `DELETE FROM friends WHERE 
       (user_id = ? AND friend_id = ?) OR 
       (user_id = ? AND friend_id = ?)`,
            [userId, friendId, friendId, userId]
        );
    }
};
