# 🌾 开心农场 - 偷菜小游戏

一个模仿QQ空间农场的偷菜小游戏，使用 Vue 3 + Node.js 开发。

## 功能特性

- 🌱 **种植系统**：多种作物可选，不同生长周期和收益
- 🥬 **收获系统**：作物成熟后可收获获得金币
- 🥷 **偷菜功能**：访问好友农场偷取成熟作物
- 👥 **好友系统**：添加好友，互相访问农场
- 💰 **经济系统**：金币购买种子，升级获得经验
- 🏪 **种子商店**：查看和购买各类种子

## 技术栈

### 前端
- Vue 3 + Vite
- Vue Router 4
- Pinia 状态管理
- Axios HTTP 客户端

### 后端
- Node.js + Express
- SQLite (better-sqlite3)
- JWT 认证
- RESTful API

## 快速开始

### 1. 启动后端服务

```bash
cd server
npm install
npm run dev
```

后端将在 http://localhost:3000 启动

### 2. 启动前端服务

```bash
cd client
npm install
npm run dev
```

前端将在 http://localhost:5173 启动

## 游戏玩法

1. **注册账号**：新用户注册即送 100 金币和 6 块农田
2. **种植作物**：在商店查看作物信息，点击空地块选择种子种植
3. **等待生长**：作物会按照设定时间自动生长
4. **收获作物**：作物成熟后点击收获，获得金币和经验
5. **添加好友**：搜索用户名添加好友
6. **偷菜**：访问好友农场，偷取已成熟的作物（每种作物只能偷一次，最多偷30%）

## 作物一览

| 作物 | 图标 | 价格 | 生长时间 | 收获金币 | 经验 |
|------|------|------|----------|----------|------|
| 白菜 | 🥬 | 10 | 1分钟 | 25 | 5 |
| 胡萝卜 | 🥕 | 20 | 2分钟 | 50 | 10 |
| 玉米 | 🌽 | 30 | 3分钟 | 80 | 15 |
| 番茄 | 🍅 | 50 | 5分钟 | 130 | 25 |
| 草莓 | 🍓 | 80 | 8分钟 | 200 | 40 |
| 西瓜 | 🍉 | 150 | 15分钟 | 400 | 80 |

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 农场
- `GET /api/farm` - 获取我的农场
- `GET /api/farm/visit/:userId` - 访问好友农场
- `POST /api/farm/plant` - 种植作物
- `POST /api/farm/harvest` - 收获作物
- `POST /api/farm/steal` - 偷菜

### 好友
- `GET /api/friends` - 好友列表
- `GET /api/friends/search` - 搜索用户
- `POST /api/friends/add` - 添加好友
- `DELETE /api/friends/:id` - 删除好友

### 商店
- `GET /api/shop/seeds` - 种子列表

## 项目结构

```
farm-game/
├── client/                 # Vue 前端
│   ├── src/
│   │   ├── api/           # API 请求
│   │   ├── components/    # 组件
│   │   ├── router/        # 路由
│   │   ├── stores/        # Pinia 状态
│   │   └── views/         # 页面
│   └── package.json
│
├── server/                 # Node.js 后端
│   ├── src/
│   │   ├── config/        # 配置
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   └── routes/        # 路由
│   └── package.json
│
└── README.md
```

## 开发说明

- 生长时间设置较短（分钟级）以便于测试，正式环境可调整为小时/天
- 数据库使用 SQLite，数据存储在 `server/database.sqlite`
- JWT Token 有效期为 7 天
