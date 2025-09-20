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

// 添加新页面
function addPage(req, res) {
    // 实现将在后续版本中完成
}