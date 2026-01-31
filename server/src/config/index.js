// 数据库配置
export const database = {
  filename: './database.sqlite'
};

// JWT 配置
export const jwt = {
  secret: 'farm-game-secret-key-2024',
  expiresIn: '7d'
};

// 作物配置
export const crops = {
  cabbage: {
    name: '白菜',
    icon: '🥬',
    price: 10,
    growTime: 60 * 1000, // 1分钟
    harvest: 25,
    exp: 5
  },
  carrot: {
    name: '胡萝卜',
    icon: '🥕',
    price: 20,
    growTime: 2 * 60 * 1000, // 2分钟
    harvest: 50,
    exp: 10
  },
  corn: {
    name: '玉米',
    icon: '🌽',
    price: 30,
    growTime: 3 * 60 * 1000, // 3分钟
    harvest: 80,
    exp: 15
  },
  tomato: {
    name: '番茄',
    icon: '🍅',
    price: 50,
    growTime: 5 * 60 * 1000, // 5分钟
    harvest: 130,
    exp: 25
  },
  strawberry: {
    name: '草莓',
    icon: '🍓',
    price: 80,
    growTime: 8 * 60 * 1000, // 8分钟
    harvest: 200,
    exp: 40
  },
  watermelon: {
    name: '西瓜',
    icon: '🍉',
    price: 150,
    growTime: 15 * 60 * 1000, // 15分钟
    harvest: 400,
    exp: 80
  }
};

// 游戏配置
export const game = {
  initialCoins: 100,
  initialPlots: 6,
  maxPlots: 9,
  stealPercentage: 0.3, // 最多偷30%
  levelExpBase: 100 // 每级所需经验基数
};
