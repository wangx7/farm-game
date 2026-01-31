import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { jwt as jwtConfig } from '../config/index.js';

const router = express.Router();

// 注册
router.post('/register', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        if (username.length < 2 || username.length > 20) {
            return res.status(400).json({ error: '用户名长度需在2-20个字符之间' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: '密码长度至少4个字符' });
        }

        // 检查用户名是否已存在
        const existing = User.findByUsername(username);
        if (existing) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        const userId = User.create(username, password);
        const token = jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
        const user = User.findById(userId);

        res.json({
            message: '注册成功',
            token,
            user
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '注册失败' });
    }
});

// 登录
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        const user = User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        if (!User.verifyPassword(password, user.password)) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const token = jwt.sign({ userId: user.id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                coins: user.coins,
                level: user.level,
                exp: user.exp
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '登录失败' });
    }
});

// 获取当前用户信息
router.get('/me', (req, res) => {
    // 需要先经过auth中间件
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: '未登录' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtConfig.secret);
        const user = User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: 'Token无效' });
    }
});

export default router;
