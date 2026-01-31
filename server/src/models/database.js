import initSqlJs from 'sql.js';
import { database } from '../config/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../', database.filename);

let db = null;

// 初始化数据库
async function initDb() {
  const SQL = await initSqlJs();

  // 尝试加载现有数据库
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      coins INTEGER DEFAULT 100,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建地块表
  db.run(`
    CREATE TABLE IF NOT EXISTS plots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plot_index INTEGER NOT NULL,
      crop_type TEXT,
      planted_at DATETIME,
      stolen_by TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, plot_index)
    )
  `);

  // 创建好友表
  db.run(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id),
      UNIQUE(user_id, friend_id)
    )
  `);

  saveDb();
  return db;
}

// 保存数据库到文件
function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

// 获取数据库实例
function getDb() {
  return db;
}

// 辅助函数：执行查询返回单行
function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

// 辅助函数：执行查询返回多行
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// 辅助函数：执行插入语句，返回插入的ID
function insert(sql, params = []) {
  db.run(sql, params);
  // sql.js 获取 last_insert_rowid 的正确方式
  const result = db.exec("SELECT last_insert_rowid() as id");
  const lastId = result[0]?.values[0]?.[0] || 0;
  saveDb();
  return lastId;
}

// 辅助函数：执行SQL语句（更新/删除等）
function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return {
    changes: db.getRowsModified()
  };
}

export { initDb, getDb, get, all, run, insert, saveDb };
