import express from 'express';
import cors from 'cors';
import { initDb } from './models/database.js';
import authRoutes from './routes/auth.js';
import farmRoutes from './routes/farm.js';
import friendsRoutes from './routes/friends.js';
import shopRoutes from './routes/shop.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/shop', shopRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '🌱 农场服务运行中' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 初始化数据库后启动服务器
async function start() {
    try {
        await initDb();
        console.log('✅ 数据库初始化成功');

        app.listen(PORT, () => {
            console.log(`🌾 农场游戏服务器运行在 http://localhost:${PORT}`);
            console.log(`📚 API 文档:`);
            console.log(`   POST /api/auth/register - 注册`);
            console.log(`   POST /api/auth/login - 登录`);
            console.log(`   GET  /api/farm - 获取我的农场`);
            console.log(`   POST /api/farm/plant - 种植作物`);
            console.log(`   POST /api/farm/harvest - 收获作物`);
            console.log(`   POST /api/farm/steal - 偷菜`);
            console.log(`   GET  /api/friends - 好友列表`);
            console.log(`   GET  /api/shop/seeds - 种子商店`);
        });
    } catch (error) {
        console.error('❌ 启动失败:', error);
        process.exit(1);
    }
}

start();
