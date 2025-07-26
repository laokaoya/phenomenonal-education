# 节点颜色功能调试指南

## 问题描述
在My Journey界面中，提问模式和游戏模式的节点图标颜色没有变化。

## 调试步骤

### 1. 访问测试页面
打开浏览器访问：`http://localhost:8000/test-colors.html`

这个页面会显示：
- 三种模式的颜色预览
- 测试 `getTypeColor` 方法的功能
- 测试节点创建和颜色分配

### 2. 检查主应用程序
访问：`http://localhost:8000/index.html`

### 3. 使用浏览器控制台调试

在浏览器控制台中运行以下命令：

```javascript
// 检查当前journey的节点状态
debugJourney()

// 手动测试颜色函数
LearningNode.getTypeColor('exploration', '解释模式')  // 应该返回 #3B82F6
LearningNode.getTypeColor('exploration', '提问模式')  // 应该返回 #F59E0B
LearningNode.getTypeColor('exploration', '游戏模式')  // 应该返回 #10B981
```

### 4. 清除浏览器缓存
如果颜色仍然没有变化，尝试：
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 5. 检查本地存储
在控制台中运行：
```javascript
// 查看所有journey
console.log(JSON.parse(localStorage.getItem('phenomenal_learning_journeys')))

// 查看所有节点
console.log(JSON.parse(localStorage.getItem('phenomenal_learning_nodes')))
```

## 预期结果

### 颜色映射
- **解释模式**: 蓝色 (#3B82F6)
- **提问模式**: 橙色 (#F59E0B)  
- **游戏模式**: 绿色 (#10B981)

### 显示位置
1. **左侧地图**: 节点圆圈颜色
2. **右侧卡片**: 模式徽章颜色
3. **悬停提示**: 显示节点标题和模式

## 常见问题

### 问题1: 现有节点没有颜色变化
**原因**: 现有节点可能没有 `mode` 属性
**解决**: 应用程序会自动为现有节点添加模式属性

### 问题2: 新创建的节点颜色正确
**原因**: 新节点创建时会自动分配模式
**验证**: 创建新的exploration节点，检查颜色是否正确

### 问题3: 控制台显示错误
**检查**: 
1. 确保所有JavaScript文件正确加载
2. 检查是否有语法错误
3. 查看网络请求是否成功

## 技术实现

### 修改的文件
1. `js/models.js` - 修改 `getTypeColor` 方法
2. `js/components.js` - 修改节点渲染逻辑
3. `js/app.js` - 添加模式分配和调试功能
4. `styles/components.css` - 添加模式徽章样式

### 关键代码
```javascript
// 颜色获取逻辑
static getTypeColor(type, mode) {
    if (mode) {
        const modeColors = {
            '解释模式': '#3B82F6',
            '提问模式': '#F59E0B', 
            '游戏模式': '#10B981'
        };
        return modeColors[mode] || modeColors['解释模式'];
    }
    // 后备到type颜色
    return colors[type] || colors.exploration;
}
``` 