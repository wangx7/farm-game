import { get, all, run } from './database.js';
import { crops } from '../config/index.js';

export const Plot = {
    // 获取用户所有地块
    getByUserId(userId) {
        const plots = all('SELECT * FROM plots WHERE user_id = ? ORDER BY plot_index', [userId]);
        return plots.map(plot => this.calculateGrowthStage(plot));
    },

    // 计算作物生长阶段
    calculateGrowthStage(plot) {
        if (!plot.crop_type || !plot.planted_at) {
            return { ...plot, stage: 0, progress: 0, isReady: false };
        }

        const cropConfig = crops[plot.crop_type];
        if (!cropConfig) {
            return { ...plot, stage: 0, progress: 0, isReady: false };
        }

        // SQLite的datetime('now')返回UTC时间格式如 "2024-01-01 12:00:00"
        // 需要添加 'Z' 后缀让JavaScript正确解析为UTC时间
        const plantedTimeStr = plot.planted_at.includes('Z')
            ? plot.planted_at
            : plot.planted_at.replace(' ', 'T') + 'Z';
        const plantedTime = new Date(plantedTimeStr).getTime();
        const now = Date.now();
        const elapsed = now - plantedTime;
        const growTime = cropConfig.growTime;

        const progress = Math.min(elapsed / growTime, 1);
        const stage = Math.floor(progress * 3) + 1; // 1-4阶段
        const isReady = progress >= 1;

        return {
            ...plot,
            stage: Math.min(stage, 4),
            progress: Math.round(progress * 100),
            isReady,
            cropConfig,
            stolenBy: JSON.parse(plot.stolen_by || '[]')
        };
    },

    // 种植作物
    plant(userId, plotIndex, cropType) {
        return run(
            `UPDATE plots SET crop_type = ?, planted_at = datetime('now'), stolen_by = '[]'
       WHERE user_id = ? AND plot_index = ? AND crop_type IS NULL`,
            [cropType, userId, plotIndex]
        );
    },

    // 收获作物
    harvest(userId, plotIndex) {
        return run(
            `UPDATE plots SET crop_type = NULL, planted_at = NULL, stolen_by = '[]'
       WHERE user_id = ? AND plot_index = ?`,
            [userId, plotIndex]
        );
    },

    // 获取单个地块
    getOne(userId, plotIndex) {
        const plot = get('SELECT * FROM plots WHERE user_id = ? AND plot_index = ?', [userId, plotIndex]);
        return plot ? this.calculateGrowthStage(plot) : null;
    },

    // 偷菜 - 更新被偷记录
    addStolenRecord(userId, plotIndex, thiefId) {
        const plot = this.getOne(userId, plotIndex);
        if (!plot) return null;

        const stolenBy = plot.stolenBy || [];
        stolenBy.push(thiefId);

        return run(
            `UPDATE plots SET stolen_by = ? WHERE user_id = ? AND plot_index = ?`,
            [JSON.stringify(stolenBy), userId, plotIndex]
        );
    }
};
