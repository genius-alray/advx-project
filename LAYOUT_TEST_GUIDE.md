# 布局测试指南

## 测试目标

验证记忆管理页面和聊天页面的布局修复是否有效，确保在各种设备和屏幕尺寸下都能正常显示。

## 测试环境

### 桌面端测试
1. **Chrome DevTools**
   - 打开开发者工具 (F12)
   - 切换到设备模拟模式
   - 测试不同设备尺寸

2. **浏览器窗口调整**
   - 将浏览器窗口调整到最小宽度
   - 逐渐增加宽度观察布局变化

### 移动端测试
1. **真实设备测试**
   - iPhone (各种尺寸)
   - Android 设备
   - 平板设备

2. **模拟器测试**
   - Chrome DevTools 设备模拟
   - Firefox 响应式设计模式

## 测试用例

### 1. 记忆管理页面测试

#### 测试步骤
```
1. 创建一个角色
2. 进入角色记忆管理页面 (/role/[id]/memory)
3. 添加以下测试数据：
   - 短记忆：正常长度的文本
   - 长记忆：超过200字的长文本
   - 超长单词：包含很长英文单词的文本
   - 特殊字符：包含emoji和特殊符号的文本
```

#### 验证点
- [ ] 页面标题不超出容器宽度
- [ ] 角色名称过长时正确截断
- [ ] 添加记忆按钮在小屏幕上正确换行
- [ ] 记忆列表项不超出容器
- [ ] 长文本记忆正确换行
- [ ] 编辑模式下文本域不超出容器
- [ ] 操作按钮始终可见且可点击

#### 测试数据示例
```
短记忆：
这是一段正常长度的记忆文本，用于测试基本布局。

长记忆：
这是一段很长很长的记忆文本，用于测试长文本的换行效果。这段文本包含了很多内容，需要确保在各种屏幕尺寸下都能正确显示，不会超出容器的边界。我们需要验证文本是否能够正确换行，以及是否会出现水平滚动条。

超长单词：
This is a test with supercalifragilisticexpialidocious and pneumonoultramicroscopicsilicovolcanoconiosiswhichisaverylongwordthatmightcauselayoutissues.

特殊字符：
这是包含emoji的记忆 🎉🎊✨ 还有一些特殊符号 ★☆♠♣♥♦ 以及各种标点符号！！！？？？
```

### 2. 聊天页面测试

#### 测试步骤
```
1. 进入聊天页面 (/chat/[roleId])
2. 发送以下测试消息：
   - 短消息：正常长度
   - 长消息：超过100字
   - 超长单词消息
   - 多行消息（包含换行符）
   - 特殊字符消息
```

#### 验证点
- [ ] 角色名称和描述不超出头部容器
- [ ] 用户消息气泡不超出屏幕右侧
- [ ] AI回复消息气泡不超出屏幕左侧
- [ ] 长消息正确换行
- [ ] 消息输入框不被压缩
- [ ] 重试区域布局正确
- [ ] 滚动到底部功能正常

#### 测试消息示例
```
短消息：
你好！

长消息：
这是一条很长的消息，用于测试消息气泡的换行效果。我们需要确保这条消息能够在各种屏幕尺寸下正确显示，不会超出屏幕边界，同时保持良好的可读性。

超长单词：
Supercalifragilisticexpialidocious pneumonoultramicroscopicsilicovolcanoconiosistest

多行消息：
这是第一行
这是第二行
这是第三行

特殊字符：
🎉🎊✨ Hello World! ★☆♠♣♥♦
```

### 3. 响应式测试

#### 屏幕尺寸测试
```
1. 320px (iPhone SE)
2. 375px (iPhone 12 mini)
3. 414px (iPhone 12 Pro Max)
4. 768px (iPad)
5. 1024px (iPad Pro)
6. 1200px+ (桌面)
```

#### 方向测试
- [ ] 竖屏模式正常显示
- [ ] 横屏模式正常显示
- [ ] 方向切换时布局稳定

### 4. 边界情况测试

#### 极端数据测试
```
1. 空内容
2. 单个字符
3. 1000+字符的超长文本
4. 纯数字/纯英文/纯中文
5. 混合语言内容
```

#### 网络状况测试
- [ ] 慢网络下加载正常
- [ ] 离线状态下布局稳定
- [ ] 加载失败时错误提示正确显示

## 自动化测试

### Playwright 测试示例
```javascript
// 测试记忆管理页面布局
test('memory page layout', async ({ page }) => {
  await page.goto('/role/test-role/memory');
  
  // 检查容器不超出视口
  const container = page.locator('.container-safe');
  const boundingBox = await container.boundingBox();
  const viewport = page.viewportSize();
  
  expect(boundingBox.width).toBeLessThanOrEqual(viewport.width);
});

// 测试消息气泡宽度
test('chat message width', async ({ page }) => {
  await page.goto('/chat/test-role');
  
  // 发送长消息
  await page.fill('input[placeholder="输入消息..."]', 'Very long message...');
  await page.click('button[type="submit"]');
  
  // 检查消息气泡宽度
  const messageBubble = page.locator('.message-bubble').last();
  const bubbleBox = await messageBubble.boundingBox();
  const viewport = page.viewportSize();
  
  expect(bubbleBox.width).toBeLessThanOrEqual(viewport.width * 0.75);
});
```

## 问题排查

### 常见问题

1. **水平滚动条出现**
   - 检查是否使用了 `w-screen`
   - 确认容器有 `overflow-hidden`
   - 验证子元素没有固定宽度

2. **文本被截断**
   - 检查父容器是否有 `min-w-0`
   - 确认使用了正确的文本换行类

3. **按钮被压缩**
   - 确认按钮有 `flex-shrink-0`
   - 检查按钮组是否使用 `flex-wrap`

4. **布局在某些设备上异常**
   - 使用浏览器开发工具模拟该设备
   - 检查CSS是否有设备特定的问题

### 调试工具

1. **Chrome DevTools**
   - Elements 面板查看元素尺寸
   - Computed 面板查看最终样式
   - Device 模拟器测试响应式

2. **Firefox DevTools**
   - Flexbox 检查器
   - Grid 检查器
   - 响应式设计模式

## 验收标准

### 必须满足
- [ ] 无水平滚动条
- [ ] 所有文本可读
- [ ] 所有按钮可点击
- [ ] 布局在所有测试设备上正常

### 性能要求
- [ ] 页面加载时间 < 3秒
- [ ] 布局重排次数最小化
- [ ] 内存使用合理

### 用户体验
- [ ] 视觉层次清晰
- [ ] 交互反馈及时
- [ ] 错误状态友好
