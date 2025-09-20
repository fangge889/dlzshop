const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/css', express.static(path.join(__dirname, '../source/css')));
app.use('/js', express.static(path.join(__dirname, '../source/js')));
app.use('/images', express.static(path.join(__dirname, '../source/images')));
app.use('/img', express.static(path.join(__dirname, '../source/img')));
app.use('/fonts', express.static(path.join(__dirname, '../source/fonts')));

// 路由
const apiRoutes = require('./routes/api');
app.get('/api/pages', apiRoutes.getPages);
app.get('/api/pages/:id', apiRoutes.getPage);
app.post('/api/pages', apiRoutes.savePage);
app.delete('/api/pages/:id', apiRoutes.deletePage);
app.post('/api/pages/:id/publish', apiRoutes.publishPage);
app.post('/api/pages/:id/unpublish', apiRoutes.unpublishPage);
app.get('/api/navigation', apiRoutes.getNavigation);
app.get('/api/site-config', apiRoutes.getSiteConfig);
app.post('/api/site-config', apiRoutes.updateSiteConfig);

// 页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../source/index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../source/admin/index.html'));
});

app.get('/admin/editor', (req, res) => {
    res.sendFile(path.join(__dirname, '../source/admin/editor.html'));
});

// 动态页面路由
app.get('/:pageId', (req, res) => {
    const pageId = req.params.pageId;
    
    // 检查是否存在对应的页面文件
    const pagePath = path.join(__dirname, `../source/${pageId}/index.html`);
    
    if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
    } else {
        // 如果没有找到特定页面，返回404页面
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>页面未找到</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                <div class="container">
                    <h1>404 - 页面未找到</h1>
                    <p>抱歉，您访问的页面不存在。</p>
                    <a href="/">返回首页</a>
                </div>
            </body>
            </html>
        `);
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;