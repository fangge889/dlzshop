const Page = require('./models/Page');
const { createConnection, initDatabase } = require('./database/init');
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, './data/cms.db');

// 确保数据目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

async function runTests() {
    console.log('开始测试Page模型...');
    
    try {
        // 初始化数据库
        console.log('初始化数据库...');
        const db = createConnection();
        
        // 创建必要的表（简化版）
        await new Promise((resolve, reject) => {
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
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
        
        // 插入测试用户
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT OR IGNORE INTO users (id, username, email, password_hash, role)
                VALUES (1, 'testuser', 'test@example.com', 'hash123', 'editor')
            `, [], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        db.close();
        
        // 创建Page模型实例
        const pageModel = new Page();
        
        // 测试1: 创建页面
        console.log('\n测试1: 创建页面');
        const pageData = {
            page_id: 'test-page-' + Date.now(),
            title: '测试页面',
            slug: 'test-page-' + Date.now(),
            content: '这是一个测试页面的内容',
            author_id: 1
        };
        
        const createdPage = await pageModel.create(pageData);
        console.log('✓ 页面创建成功:', createdPage);
        
        // 测试2: 根据ID获取页面
        console.log('\n测试2: 根据ID获取页面');
        const fetchedPage = await pageModel.getById(createdPage.id);
        console.log('✓ 页面获取成功:', {
            id: fetchedPage.id,
            title: fetchedPage.title,
            author_name: fetchedPage.author_name
        });
        
        // 测试3: 根据page_id获取页面
        console.log('\n测试3: 根据page_id获取页面');
        const fetchedPageByPageId = await pageModel.getByPageId(pageData.page_id);
        console.log('✓ 页面获取成功:', {
            id: fetchedPageByPageId.id,
            page_id: fetchedPageByPageId.page_id,
            title: fetchedPageByPageId.title
        });
        
        // 测试4: 根据slug获取页面
        console.log('\n测试4: 根据slug获取页面');
        const fetchedPageBySlug = await pageModel.getBySlug(pageData.slug);
        console.log('✓ 页面获取成功:', {
            id: fetchedPageBySlug.id,
            slug: fetchedPageBySlug.slug,
            title: fetchedPageBySlug.title
        });
        
        // 测试5: 获取所有页面
        console.log('\n测试5: 获取所有页面');
        const allPages = await pageModel.getAll();
        console.log('✓ 获取到所有页面，数量:', allPages.length);
        
        // 测试6: 更新页面
        console.log('\n测试6: 更新页面');
        const updateResult = await pageModel.update(createdPage.id, {
            title: '更新后的测试页面',
            content: '这是更新后的测试内容'
        });
        console.log('✓ 页面更新成功，影响行数:', updateResult.changes);
        
        // 验证更新
        const updatedPage = await pageModel.getById(createdPage.id);
        console.log('  更新后标题:', updatedPage.title);
        
        // 测试7: 发布页面
        console.log('\n测试7: 发布页面');
        const publishResult = await pageModel.publish(createdPage.id);
        console.log('✓ 页面发布成功，影响行数:', publishResult.changes);
        
        // 验证发布状态
        const publishedPage = await pageModel.getById(createdPage.id);
        console.log('  发布后状态:', publishedPage.status);
        
        // 测试8: 保存页面版本
        console.log('\n测试8: 保存页面版本');
        const versionResult = await pageModel.saveVersion(createdPage.id, {
            title: '版本1标题',
            content: '版本1内容',
            author_id: 1
        });
        console.log('✓ 页面版本保存成功:', versionResult);
        
        // 测试9: 获取页面版本历史
        console.log('\n测试9: 获取页面版本历史');
        const versions = await pageModel.getVersions(createdPage.id);
        console.log('✓ 获取到页面版本历史，数量:', versions.length);
        
        // 测试10: 获取页面统计信息
        console.log('\n测试10: 获取页面统计信息');
        const stats = await pageModel.getStats();
        console.log('✓ 获取到页面统计信息:', stats);
        
        // 测试11: 检查slug唯一性
        console.log('\n测试11: 检查slug唯一性');
        const isUnique = await pageModel.isSlugUnique('unique-slug-' + Date.now());
        const isNotUnique = await pageModel.isSlugUnique(pageData.slug);
        console.log('✓ 唯一slug检查结果:', isUnique);
        console.log('✓ 非唯一slug检查结果:', isNotUnique);
        
        // 测试12: 取消发布页面
        console.log('\n测试12: 取消发布页面');
        const unpublishResult = await pageModel.unpublish(createdPage.id);
        console.log('✓ 页面取消发布成功，影响行数:', unpublishResult.changes);
        
        // 验证取消发布状态
        const unpublishedPage = await pageModel.getById(createdPage.id);
        console.log('  取消发布后状态:', unpublishedPage.status);
        
        // 测试13: 删除页面
        console.log('\n测试13: 删除页面');
        const deleteResult = await pageModel.delete(createdPage.id);
        console.log('✓ 页面删除成功，影响行数:', deleteResult.changes);
        
        // 验证删除
        const deletedPage = await pageModel.getById(createdPage.id);
        console.log('  删除后查询结果:', deletedPage ? '页面仍存在' : '页面已删除');
        
        // 关闭数据库连接
        pageModel.close();
        
        console.log('\n🎉 所有测试通过！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
        console.error('错误详情:', error.message);
        console.error('堆栈信息:', error.stack);
    }
}

// 运行测试
runTests();