import express from 'express';
import { crops } from '../config/index.js';

const router = express.Router();

// 获取商店种子列表
router.get('/seeds', (req, res) => {
    const seeds = Object.entries(crops).map(([key, value]) => ({
        type: key,
        ...value
    }));

    res.json({ seeds });
});

export default router;
