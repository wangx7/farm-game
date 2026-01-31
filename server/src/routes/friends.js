import express from 'express';
import { Friend } from '../models/Friend.js';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// 获取好友列表
router.get('/', (req, res) => {
    try {
        const friends = Friend.getList(req.userId);
        res.json({ friends });
    } catch (error) {
        console.error('获取好友列表错误:', error);
        res.status(500).json({ error: '获取好友列表失败' });
    }
});

// 搜索用户
router.get('/search', (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({ error: '请输入搜索关键词' });
        }

        const users = User.search(keyword, req.userId);

        // 标记是否已是好友
        const friends = Friend.getList(req.userId);
        const friendIds = new Set(friends.map(f => f.id));

        const result = users.map(user => ({
            ...user,
            isFriend: friendIds.has(user.id)
        }));

        res.json({ users: result });
    } catch (error) {
        console.error('搜索用户错误:', error);
        res.status(500).json({ error: '搜索失败' });
    }
});

// 添加好友
router.post('/add', (req, res) => {
    try {
        const { friendId } = req.body;

        if (!friendId) {
            return res.status(400).json({ error: '参数错误' });
        }

        if (friendId === req.userId) {
            return res.status(400).json({ error: '不能添加自己为好友' });
        }

        const friend = User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ error: '用户不存在' });
        }

        if (Friend.isFriend(req.userId, friendId)) {
            return res.status(400).json({ error: '已经是好友了' });
        }

        Friend.add(req.userId, friendId);

        res.json({
            message: '添加好友成功',
            friend
        });
    } catch (error) {
        console.error('添加好友错误:', error);
        res.status(500).json({ error: '添加好友失败' });
    }
});

// 删除好友
router.delete('/:friendId', (req, res) => {
    try {
        const friendId = parseInt(req.params.friendId);

        if (!Friend.isFriend(req.userId, friendId)) {
            return res.status(400).json({ error: '不是好友关系' });
        }

        Friend.remove(req.userId, friendId);

        res.json({ message: '删除好友成功' });
    } catch (error) {
        console.error('删除好友错误:', error);
        res.status(500).json({ error: '删除好友失败' });
    }
});

export default router;
