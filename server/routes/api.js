const fs = require('fs');
const path = require('path');

// 数据文件路径
const pagesFile = path.join(__dirname, '../../source/_data/pages.json');
const navigationFile = path.join(__dirname, '../../source/_data/navigation.json');
const siteConfigFile = path.join(__dirname, '../../source/_data/site_config.json');

// 读取JSON文件的辅助函数
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error);
        return null;
    }
}

// 写入JSON文件的辅助函数
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`写入文件失败 ${filePath}:`, error);
        return false;
    }
}

// 获取所有页面
function getPages(req, res) {
    const pages = readJsonFile(pagesFile);
    if (pages) {
        res.json(pages);
    } else {
        res.status(500).json({ error: '无法读取页面数据' });
    }
}

// 获取导航菜单
function getNavigation(req, res) {
    const navigation = readJsonFile(navigationFile);
    if (navigation) {
        res.json(navigation);
    } else {
        res.status(500).json({ error: '无法读取导航数据' });
    }
}

// 获取站点配置
function getSiteConfig(req, res) {
    const config = readJsonFile(siteConfigFile);
    if (config) {
        res.json(config);
    } else {
        res.status(500).json({ error: '无法读取站点配置' });
    }
}

// 更新站点配置
function updateSiteConfig(req, res) {
    const newConfig = req.body;
    const success = writeJsonFile(siteConfigFile, newConfig);
    
    if (success) {
        res.json({ message: '站点配置更新成功' });
    } else {
        res.status(500).json({ error: '无法更新站点配置' });
    }
}

// 获取特定页面
function getPage(req, res) {
    const pageId = req.params.id;
    const pages = readJsonFile(pagesFile);
    
    if (pages) {
        const page = pages.find(p => p.id === pageId);
        if (page) {
            res.json(page);
        } else {
            res.status(404).json({ error: '页面未找到' });
        }
    } else {
        res.status(500).json({ error: '无法读取页面数据' });
    }
}

// 添加或更新页面
function savePage(req, res) {
    const pageData = req.body;
    const pages = readJsonFile(pagesFile) || [];
    
    // 查找是否已存在相同ID的页面
    const existingPageIndex = pages.findIndex(p => p.id === pageData.id);
    
    if (existingPageIndex >= 0) {
        // 更新现有页面
        pages[existingPageIndex] = pageData;
    } else {
        // 添加新页面
        pages.push(pageData);
    }
    
    const success = writeJsonFile(pagesFile, pages);
    
    if (success) {
        res.json({ message: '页面保存成功', page: pageData });
    } else {
        res.status(500).json({ error: '无法保存页面' });
    }
}

// 删除页面
function deletePage(req, res) {
    const pageId = req.params.id;
    let pages = readJsonFile(pagesFile) || [];
    
    pages = pages.filter(p => p.id !== pageId);
    
    const success = writeJsonFile(pagesFile, pages);
    
    if (success) {
        res.json({ message: '页面删除成功' });
    } else {
        res.status(500).json({ error: '无法删除页面' });
    }
}

// 发布页面
function publishPage(req, res) {
    const pageId = req.params.id;
    const pages = readJsonFile(pagesFile) || [];
    
    const pageIndex = pages.findIndex(p => p.id === pageId);
    
    if (pageIndex >= 0) {
        // 更新页面状态为已发布
        pages[pageIndex].status = 'published';
        pages[pageIndex].updated_at = new Date().toISOString();
        
        const success = writeJsonFile(pagesFile, pages);
        
        if (success) {
            res.json({ message: '页面发布成功', page: pages[pageIndex] });
        } else {
            res.status(500).json({ error: '无法发布页面' });
        }
    } else {
        res.status(404).json({ error: '页面未找到' });
    }
}

// 取消发布页面
function unpublishPage(req, res) {
    const pageId = req.params.id;
    const pages = readJsonFile(pagesFile) || [];
    
    const pageIndex = pages.findIndex(p => p.id === pageId);
    
    if (pageIndex >= 0) {
        // 更新页面状态为草稿
        pages[pageIndex].status = 'draft';
        pages[pageIndex].updated_at = new Date().toISOString();
        
        const success = writeJsonFile(pagesFile, pages);
        
        if (success) {
            res.json({ message: '页面已转为草稿', page: pages[pageIndex] });
        } else {
            res.status(500).json({ error: '无法更新页面状态' });
        }
    } else {
        res.status(404).json({ error: '页面未找到' });
    }
}