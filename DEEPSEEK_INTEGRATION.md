# DeepSeek API 集成说明

## 概述

本项目已集成 DeepSeek API 来提供智能对话功能。AI 角色现在可以基于用户添加的记忆和背景信息进行个性化回复。

## 配置步骤

### 1. 获取 DeepSeek API Key

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册账号并登录
3. 前往 [API Keys 页面](https://platform.deepseek.com/api_keys)
4. 创建新的 API Key

### 2. 配置环境变量

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 在 `.env` 文件中设置你的 API Key：
   ```env
   DEEPSEEK_API_KEY=your_actual_api_key_here
   ```

### 3. 启动应用

```bash
npm run dev
```

## 功能特性

### 智能对话
- 基于角色背景信息生成个性化回复
- 集成用户添加的记忆和故事作为上下文
- 支持多轮对话历史

### 错误处理
- 自动重试机制
- 友好的错误提示
- 失败消息重发功能

### 测试 API 连接

访问 `/api/test-deepseek` 端点来测试 DeepSeek API 连接是否正常：

```bash
curl http://localhost:3000/api/test-deepseek
```

## API 使用说明

### 对话流程

1. 用户发送消息到 `/api/thread/{threadId}/text`
2. 前端调用 `/api/thread/{threadId}/reply` 获取 AI 回复
3. DeepSeek API 基于以下信息生成回复：
   - 角色的名称和描述
   - 角色的背景故事
   - 用户添加的记忆和知识
   - 对话历史

### 系统提示词结构

```
你是 {角色名称}，{角色描述}。

背景信息：{角色背景}

相关记忆和故事：
{用户添加的记忆内容}

请以这个角色的身份回复用户的消息...
```

## 自定义配置

### 模型参数

在 `server/api/thread/[id]/reply.get.ts` 中可以调整以下参数：

- `model`: 使用的模型（默认：`deepseek-chat`）
- `temperature`: 创造性程度（默认：`0.7`）
- `max_tokens`: 最大回复长度（默认：`1000`）

### 知识库集成

系统会自动从 `/api/knowledge` 获取用户添加的记忆内容，并将其作为上下文提供给 AI。

## 故障排除

### 常见问题

1. **API Key 无效**
   - 检查 `.env` 文件中的 `DEEPSEEK_API_KEY` 是否正确
   - 确认 API Key 在 DeepSeek 平台上是有效的

2. **网络连接问题**
   - 检查网络连接
   - 确认可以访问 `https://api.deepseek.com`

3. **回复生成失败**
   - 查看服务器日志获取详细错误信息
   - 使用测试端点验证 API 连接

### 日志查看

服务器端错误会记录在控制台中，包含详细的 DeepSeek API 错误信息。

## 开发说明

### 添加新功能

1. 修改 `server/api/thread/[id]/reply.get.ts` 来调整 AI 行为
2. 更新 `app/composables/useApi.ts` 来处理新的 API 响应
3. 在 `app/pages/chat/[roleId].vue` 中更新前端界面

### 测试

运行测试来验证功能：

```bash
npm run test
```

## 安全注意事项

- 永远不要在客户端代码中暴露 API Key
- 使用 Nuxt 的 `runtimeConfig` 来安全地管理环境变量
- 定期轮换 API Key

## 费用说明

DeepSeek API 按使用量计费。请在 [DeepSeek 平台](https://platform.deepseek.com/) 查看当前的定价信息。
