import express from 'express';
import { Plot } from '../models/Plot.js';
import { User } from '../models/User.js';
import { Friend } from '../models/Friend.js';
import { crops, game } from '../config/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 所有农场路由都需要登录
router.use(authMiddleware);

// 获取我的农场
router.get('/', (req, res) => {
    try {
        const user = User.findById(req.userId);
        const plots = Plot.getByUserId(req.userId);

        res.json({
            user,
            plots,
            crops: Object.entries(crops).map(([key, value]) => ({
                type: key,
                ...value
            }))
        });
    } catch (error) {
        console.error('获取农场错误:', error);
        res.status(500).json({ error: '获取农场失败' });
    }
});

// 获取好友农场
router.get('/visit/:userId', (req, res) => {
    try {
        const friendId = parseInt(req.params.userId);

        // 检查是否为好友
        if (!Friend.isFriend(req.userId, friendId)) {
            return res.status(403).json({ error: '只能访问好友的农场' });
        }

        const friend = User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ error: '用户不存在' });
        }

        const plots = Plot.getByUserId(friendId);

        res.json({
            user: friend,
            plots,
            isOwner: false
        });
    } catch (error) {
        console.error('访问好友农场错误:', error);
        res.status(500).json({ error: '访问失败' });
    }
});

// 种植作物
router.post('/plant', (req, res) => {
    try {
        const { plotIndex, cropType } = req.body;

        if (plotIndex === undefined || !cropType) {
            return res.status(400).json({ error: '参数错误' });
        }

        // 检查作物类型是否有效
        const cropConfig = crops[cropType];
        if (!cropConfig) {
            return res.status(400).json({ error: '无效的作物类型' });
        }

        // 检查金币是否足够
        const user = User.findById(req.userId);
        if (user.coins < cropConfig.price) {
            return res.status(400).json({ error: '金币不足' });
        }

        // 检查地块是否为空
        const plot = Plot.getOne(req.userId, plotIndex);
        if (!plot) {
            return res.status(400).json({ error: '地块不存在' });
        }
        if (plot.crop_type) {
            return res.status(400).json({ error: '该地块已种植作物' });
        }

        // 扣除金币
        User.updateCoins(req.userId, -cropConfig.price);

        // 种植
        Plot.plant(req.userId, plotIndex, cropType);

        res.json({
            message: '种植成功',
            user: User.findById(req.userId),
            plot: Plot.getOne(req.userId, plotIndex)
        });
    } catch (error) {
        console.error('种植错误:', error);
        res.status(500).json({ error: '种植失败' });
    }
});

// 收获作物
router.post('/harvest', (req, res) => {
    try {
        const { plotIndex } = req.body;

        if (plotIndex === undefined) {
            return res.status(400).json({ error: '参数错误' });
        }

        const plot = Plot.getOne(req.userId, plotIndex);
        if (!plot || !plot.crop_type) {
            return res.status(400).json({ error: '没有可收获的作物' });
        }

        if (!plot.isReady) {
            return res.status(400).json({ error: '作物还未成熟' });
        }

        const cropConfig = plot.cropConfig;

        // 计算收获金额（减去被偷的部分）
        const stolenCount = plot.stolenBy.length;
        const stolenAmount = Math.floor(cropConfig.harvest * game.stealPercentage * stolenCount);
        const harvestAmount = cropConfig.harvest - stolenAmount;

        // 收获
        Plot.harvest(req.userId, plotIndex);
        User.updateCoins(req.userId, harvestAmount);
        User.addExp(req.userId, cropConfig.exp);

        res.json({
            message: '收获成功',
            harvest: harvestAmount,
            exp: cropConfig.exp,
            stolen: stolenAmount,
            user: User.findById(req.userId)
        });
    } catch (error) {
        console.error('收获错误:', error);
        res.status(500).json({ error: '收获失败' });
    }
});

// 偷菜
router.post('/steal', (req, res) => {
    try {
        const { friendId, plotIndex } = req.body;

        if (!friendId || plotIndex === undefined) {
            return res.status(400).json({ error: '参数错误' });
        }

        // 检查是否为好友
        if (!Friend.isFriend(req.userId, friendId)) {
            return res.status(403).json({ error: '只能偷好友的菜' });
        }

        const plot = Plot.getOne(friendId, plotIndex);
        if (!plot || !plot.crop_type) {
            return res.status(400).json({ error: '该地块没有作物' });
        }

        if (!plot.isReady) {
            return res.status(400).json({ error: '作物还未成熟，不能偷' });
        }

        // 检查是否已经偷过
        if (plot.stolenBy.includes(req.userId)) {
            return res.status(400).json({ error: '你已经偷过这块地了' });
        }

        const cropConfig = plot.cropConfig;
        const stealAmount = Math.floor(cropConfig.harvest * game.stealPercentage);

        // 记录偷菜
        Plot.addStolenRecord(friendId, plotIndex, req.userId);

        // 给小偷加金币
        User.updateCoins(req.userId, stealAmount);

        res.json({
            message: `成功偷到 ${stealAmount} 金币的${cropConfig.name}！`,
            amount: stealAmount,
            user: User.findById(req.userId)
        });
    } catch (error) {
        console.error('偷菜错误:', error);
        res.status(500).json({ error: '偷菜失败' });
    }
});

export default router;
