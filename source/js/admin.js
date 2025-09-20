// 管理界面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 页面管理功能
    loadPages();
    loadNavigation();
    loadSiteSettings();
    
    // 绑定事件
    document.getElementById('add-page').addEventListener('click', showAddPageModal);
    document.getElementById('add-nav-item').addEventListener('click', showAddNavItemModal);
    document.getElementById('site-settings-form').addEventListener('submit', saveSiteSettings);
});

// 加载页面列表
function loadPages() {
    fetch('/api/pages')
        .then(response => response.json())
        .then(pages => {
            const tbody = document.querySelector('#pages-table tbody');
            tbody.innerHTML = '';
            
            pages.forEach(page => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${page.title}</td>
                    <td>${page.url || `/${page.id}/`}</td>
                    <td>${page.status === 'published' ? '已发布' : '草稿'}</td>
                    <td>
                        <button class="btn btn-primary" onclick="editPage('${page.id}')">编辑</button>
                        <button class="btn btn-danger" onclick="deletePage('${page.id}')">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载页面失败:', error);
            alert('加载页面失败');
        });
}

// 加载导航菜单
function loadNavigation() {
    fetch('/api/navigation')
        .then(response => response.json())
        .then(navData => {
            const navList = document.getElementById('nav-list');
            navList.innerHTML = '';
            
            navData.menu.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.title} (${item.url})</span>
                    <button class="btn btn-primary" onclick="editNavItem('${item.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="deleteNavItem('${item.id}')">删除</button>
                `;
                navList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('加载导航失败:', error);
            alert('加载导航失败');
        });
}

// 加载站点设置
function loadSiteSettings() {
    fetch('/api/site-config')
        .then(response => response.json())
        .then(config => {
            document.getElementById('site-name').value = config.site_name || '';
            document.getElementById('site-description').value = config.site_description || '';
        })
        .catch(error => {
            console.error('加载站点设置失败:', error);
        });
}

// 显示添加页面模态框
function showAddPageModal() {
    alert('添加页面功能将在后续版本中实现');
}

// 编辑页面
function editPage(pageId) {
    alert(`编辑页面: ${pageId}`);
}

// 删除页面
function deletePage(pageId) {
    if (confirm(`确定要删除页面 ${pageId} 吗？`)) {
        alert(`删除页面: ${pageId}`);
    }
}

// 显示添加导航项模态框
function showAddNavItemModal() {
    alert('添加导航项功能将在后续版本中实现');
}

// 编辑导航项
function editNavItem(navId) {
    alert(`编辑导航项: ${navId}`);
}

// 删除导航项
function deleteNavItem(navId) {
    if (confirm(`确定要删除导航项 ${navId} 吗？`)) {
        alert(`删除导航项: ${navId}`);
    }
}

// 保存站点设置
function saveSiteSettings(event) {
    event.preventDefault();
    
    const siteName = document.getElementById('site-name').value;
    const siteDescription = document.getElementById('site-description').value;
    
    const config = {
        site_name: siteName,
        site_description: siteDescription
    };
    
    fetch('/api/site-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
    .then(response => {
        if (response.ok) {
            alert('站点设置保存成功');
        } else {
            throw new Error('保存失败');
        }
    })
    .catch(error => {
        console.error('保存站点设置失败:', error);
        alert('保存站点设置失败');
    });
}