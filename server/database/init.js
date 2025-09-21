const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '../data/cms.db');

// 确保数据目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
function createConnection() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('数据库连接失败:', err.message);
        } else {
            console.log('SQLite数据库连接成功');
        }
    });
}

// 初始化数据库表结构
function initDatabase() {
    const db = createConnection();
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 用户表
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'editor',
                    avatar_url VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    is_active BOOLEAN DEFAULT 1
                )
            `);

            // 页面表
            db.run(`
                CREATE TABLE IF NOT EXISTS pages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    page_id VARCHAR(100) UNIQUE NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    content TEXT,
                    excerpt TEXT,
                    layout VARCHAR(50) DEFAULT 'page',
                    template VARCHAR(100),
                    status VARCHAR(20) DEFAULT 'draft',
                    author_id INTEGER,
                    featured_image VARCHAR(255),
                    meta_title VARCHAR(255),
                    meta_description TEXT,
                    meta_keywords TEXT,
                    published_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (author_id) REFERENCES users (id)
                )
            `);

            // 媒体文件表
            db.run(`
                CREATE TABLE IF NOT EXISTS media (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename VARCHAR(255) NOT NULL,
                    original_name VARCHAR(255) NOT NULL,
                    file_path VARCHAR(500) NOT NULL,
                    file_size INTEGER,
                    mime_type VARCHAR(100),
                    width INTEGER,
                    height INTEGER,
                    alt_text VARCHAR(255),
                    caption TEXT,
                    uploaded_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (uploaded_by) REFERENCES users (id)
                )
            `);

            // 分类表
            db.run(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    parent_id INTEGER,
                    sort_order INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (parent_id) REFERENCES categories (id)
                )
            `);

            // 标签表
            db.run(`
                CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 页面分类关联表
            db.run(`
                CREATE TABLE IF NOT EXISTS page_categories (
                    page_id INTEGER,
                    category_id INTEGER,
                    PRIMARY KEY (page_id, category_id),
                    FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
                )
            `);

            // 页面标签关联表
            db.run(`
                CREATE TABLE IF NOT EXISTS page_tags (
                    page_id INTEGER,
                    tag_id INTEGER,
                    PRIMARY KEY (page_id, tag_id),
                    FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
                )
            `);

            // 系统设置表
            db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key VARCHAR(100) PRIMARY KEY,
                    value TEXT,
                    type VARCHAR(20) DEFAULT 'string',
                    description TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 版本历史表
            db.run(`
                CREATE TABLE IF NOT EXISTS page_versions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    page_id INTEGER,
                    version_number INTEGER,
                    title VARCHAR(255),
                    content TEXT,
                    author_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE,
                    FOREIGN KEY (author_id) REFERENCES users (id)
                )
            `, (err) => {
                if (err) {
                    console.error('创建表失败:', err.message);
                    reject(err);
                } else {
                    console.log('数据库表结构初始化完成');
                    resolve(db);
                }
            });
        });
    });
}

// 插入默认数据
function insertDefaultData(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 插入默认管理员用户
            const bcrypt = require('bcryptjs');
            const defaultPassword = bcrypt.hashSync('admin123', 10);
            
            db.run(`
                INSERT OR IGNORE INTO users (username, email, password_hash, role)
                VALUES ('admin', 'admin@example.com', ?, 'admin')
            `, [defaultPassword]);

            // 插入默认系统设置
            const defaultSettings = [
                ['site_name', 'DLZ Shop CMS', 'string', '网站名称'],
                ['site_description', '现代化内容管理系统', 'string', '网站描述'],
                ['site_url', 'http://localhost:3000', 'string', '网站URL'],
                ['admin_email', 'admin@example.com', 'string', '管理员邮箱'],
                ['timezone', 'Asia/Shanghai', 'string', '时区设置'],
                ['language', 'zh-CN', 'string', '默认语言'],
                ['theme', 'default', 'string', '默认主题'],
                ['posts_per_page', '10', 'number', '每页文章数量']
            ];

            const stmt = db.prepare(`
                INSERT OR IGNORE INTO settings (key, value, type, description)
                VALUES (?, ?, ?, ?)
            `);

            defaultSettings.forEach(setting => {
                stmt.run(setting);
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error('插入默认数据失败:', err.message);
                    reject(err);
                } else {
                    console.log('默认数据插入完成');
                    resolve();
                }
            });
        });
    });
}

module.exports = {
    createConnection,
    initDatabase,
    insertDefaultData,
    DB_PATH
};