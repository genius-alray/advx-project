# 角色记忆系统 (Role-Specific Knowledge System)

## 概述

新的记忆系统将知识/记忆绑定到特定的角色，而不是全局存储。每个角色都有自己独立的记忆库，在对话时 AI 会使用该角色的专属记忆来生成更个性化的回复。

## 系统架构

### 后端服务

#### KnowledgeManager (`server/service/knowledgeManager.ts`)
- 管理角色特定的知识/记忆
- 支持文本和文件类型的记忆
- 提供 CRUD 操作（创建、读取、更新、删除）
- 支持批量添加记忆

#### API 端点

1. **获取角色记忆**
   ```
   GET /api/role/{roleId}/knowledge
   ```

2. **添加单条记忆**
   ```
   POST /api/role/{roleId}/knowledge
   Body: { content: string, type: "text" | "file" }
   ```

3. **批量添加记忆**
   ```
   POST /api/role/{roleId}/knowledge/batch
   Body: { contents: string[], type: "text" | "file" }
   ```

4. **更新记忆**
   ```
   PUT /api/knowledge/{knowledgeId}
   Body: { content: string }
   ```

5. **删除记忆**
   ```
   DELETE /api/knowledge/{knowledgeId}
   ```

### 前端组件

#### 记忆管理页面 (`app/pages/role/[id]/memory.vue`)
- 角色专属的记忆管理界面
- 支持添加、编辑、删除记忆
- 支持文件上传（文本文件）
- 显示记忆的创建时间和类型

#### API Composable (`app/composables/useApi.ts`)
- `useRoleKnowledge()` - 提供角色记忆的 API 操作
- 替代了旧的 `useKnowledge()` 全局记忆系统

## 数据结构

### Knowledge 接口
```typescript
interface Knowledge {
  id: string;           // 记忆唯一标识
  roleId: string;       // 所属角色ID
  content: string;      // 记忆内容
  type: "text" | "file"; // 记忆类型
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}
```

## 使用流程

### 1. 创建角色
用户在主页创建一个新的角色（数字家人）。

### 2. 添加记忆
- 点击角色卡片上的记忆图标
- 进入角色专属的记忆管理页面
- 添加关于该角色的故事、对话、背景信息

### 3. AI 对话
- 点击角色卡片进入聊天界面
- AI 会基于该角色的背景信息和记忆库生成回复
- 记忆内容会作为上下文提供给 DeepSeek API

## 与 AI 对话的集成

在 `server/api/thread/[id]/reply.get.ts` 中：

```typescript
// 获取角色的知识库内容
const knowledge = await knowledgeManager.instance.getRoleKnowledgeText(role.id);

// 构建系统提示词，包含知识库信息
const knowledgeContext = knowledge.length > 0 
  ? `\n\n相关记忆和故事：\n${knowledge.join('\n\n---\n\n')}`
  : '';
  
const systemPrompt = `你是 ${role.name}，${role.description}。

背景信息：${role.background || "暂无特殊背景"}${knowledgeContext}

请以这个角色的身份回复用户的消息...`;
```

## 功能特性

### ✅ 已实现功能

1. **角色特定记忆存储**
   - 每个角色有独立的记忆库
   - 记忆与角色绑定，不会混淆

2. **多种添加方式**
   - 手动输入文本记忆
   - 上传文本文件批量添加

3. **记忆管理**
   - 查看所有记忆列表
   - 编辑现有记忆
   - 删除不需要的记忆

4. **AI 对话集成**
   - 记忆自动作为上下文提供给 AI
   - 生成更个性化的回复

5. **用户界面**
   - 直观的记忆管理界面
   - 从主页快速访问记忆管理
   - 记忆类型和时间显示

### 🔄 迁移说明

从旧的全局记忆系统迁移到新系统：

1. **API 变更**
   - 旧：`/api/knowledge` → 新：`/api/role/{roleId}/knowledge`
   - 旧：`useKnowledge()` → 新：`useRoleKnowledge()`

2. **页面变更**
   - 移除：`/memory` 全局记忆页面
   - 新增：`/role/{roleId}/memory` 角色记忆页面

3. **导航变更**
   - 底部导航不再包含全局记忆管理
   - 记忆管理通过角色卡片访问

## 开发指南

### 添加新的记忆类型

1. 更新 `Knowledge` 接口的 `type` 字段
2. 在 `knowledgeManager.ts` 中添加处理逻辑
3. 更新前端界面支持新类型

### 扩展记忆功能

1. **标签系统**：为记忆添加标签分类
2. **搜索功能**：在记忆中搜索特定内容
3. **导入/导出**：批量导入导出记忆数据
4. **记忆优先级**：设置重要记忆的优先级

### 性能优化

1. **分页加载**：当记忆数量很多时分页显示
2. **缓存机制**：缓存常用的记忆数据
3. **索引优化**：为记忆内容建立搜索索引

## 测试

运行记忆系统相关测试：

```bash
npm run test -- role-knowledge
```

## 安全考虑

1. **权限验证**：确保用户只能访问自己的角色记忆
2. **数据验证**：验证记忆内容的格式和长度
3. **敏感信息**：避免在记忆中存储敏感个人信息

## 故障排除

### 常见问题

1. **记忆不显示在对话中**
   - 检查记忆是否正确绑定到角色
   - 验证 DeepSeek API 调用是否包含记忆上下文

2. **文件上传失败**
   - 确认文件格式为文本文件
   - 检查文件大小限制

3. **记忆编辑不生效**
   - 检查网络连接
   - 验证用户权限
