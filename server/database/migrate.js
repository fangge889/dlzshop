const fs = require('fs');
const path = require('path');
const { createConnection } = require('./init');

// 从JSON文件迁移数据到SQLite
async function migrateFromJson() {
    const db = createConnection();
    
    try {
        // 读取现有的JSON数据文件
        const pagesJsonPath = path.join(__dirname, '../../source/_data/pages.json');
        const siteConfigPath = path.join(__dirname, '../../source/_data/site_config.json');
        const navigationPath = path.join(__dirname, '../../source/_data/navigation.json');

        // 迁移页面数据
        if (fs.existsSync(pagesJsonPath)) {
            const pagesData = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf8'));
            console.log('开始迁移页面数据...');
            
            for (const page of pagesData) {
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT OR REPLACE INTO pages 
                        (page_id, title, slug, content, layout, status, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        page.id,
                        page.title,
                        page.id, // 使用id作为slug
                        page.content || '',
                        page.layout || 'page',
                        page.status || 'draft',
                        page.created_at || new Date().toISOString(),
                        page.updated_at || new Date().toISOString()
                    ], function(err) {
                        if (err) {
                            console.error('迁移页面数据失败:', err.message);
                            reject(err);
                        } else {
                            console.log(`页面 "${page.title}" 迁移成功`);
                            resolve();
                        }
                    });
                });
            }
        }

        // 迁移站点配置
        if (fs.existsSync(siteConfigPath)) {
            const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
            console.log('开始迁移站点配置...');
            
            for (const [key, value] of Object.entries(siteConfig)) {
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT OR REPLACE INTO settings (key, value, type)
                        VALUES (?, ?, ?)
                    `, [key, String(value), typeof value], function(err) {
                        if (err) {
                            console.error('迁移配置失败:', err.message);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            }
            console.log('站点配置迁移完成');
        }

        // 创建备份
        await createBackup();
        
        console.log('数据迁移完成！');
        
    } catch (error) {
        console.error('数据迁移失败:', error);
    } finally {
        db.close();
    }
}

// 创建JSON数据备份
async function createBackup() {
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath);
    }

    // 备份JSON文件
    const sourceDataDir = path.join(__dirname, '../../source/_data');
    if (fs.existsSync(sourceDataDir)) {
        const files = fs.readdirSync(sourceDataDir);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                fs.copyFileSync(
                    path.join(sourceDataDir, file),
                    path.join(backupPath, file)
                );
            }
        });
        console.log(`数据备份已创建: ${backupPath}`);
    }
}

// 从SQLite导出到JSON（用于备份或回滚）
async function exportToJson() {
    const db = createConnection();
    
    return new Promise((resolve, reject) => {
        // 导出页面数据
        db.all('SELECT * FROM pages', [], (err, pages) => {
            if (err) {
                reject(err);
                return;
            }

            const exportData = {
                pages: pages.map(page => ({
                    id: page.page_id,
                    title: page.title,
                    content: page.content,
                    layout: page.layout,
                    status: page.status,
                    created_at: page.created_at,
                    updated_at: page.updated_at
                })),
                exported_at: new Date().toISOString()
            };

            const exportPath = path.join(__dirname, '../backups/export.json');
            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
            console.log(`数据已导出到: ${exportPath}`);
            
            db.close();
            resolve(exportPath);
        });
    });
}

module.exports = {
    migrateFromJson,
    createBackup,
    exportToJson
};