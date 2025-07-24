# 我们的回响 (Echoes of Us)

> “我们不让最珍贵的声音，输给时间。”

![Echoes of Us Demo GIF](https://your-image-host.com/demo.gif)
_（强烈建议：在这里放一张项目的核心功能 GIF 动图，展示“提问->获得语音回答”的魔法时刻。可以用 GIPHY Capture 或类似工具录制）_

---

## 💡 项目理念 (The Vision)

在我们的数字时代，我们保存了无数静默的照片，却正在失去家族历史中最珍贵的东西——我们所爱之人的声音和他们承载的故事。

“我们的回响”是一个交互式 AI 记忆档案库。我们利用 AI，将长辈的口述历史转化为一个有生命的、可以对话的“数字记忆体”，让爱与智慧的声音，能够跨越时间，永远回响。

这，就是我们对 AdventureX 2025 核心主题 **“何以为人 (All We Do)”** 的回答。

## ✨ 核心功能 (Key Features)

- **记忆收录**: 用户可以轻松上传家庭成员的音频故事。
- **AI 自动处理**: 后端 AI 自动完成语音转录、故事摘要和主题分析。
- **声音克隆**: 利用 ElevenLabs 技术，为每位“记忆主人”创建独一无二的声音模型。
- **交互式对话**: 用户可以通过自然的语言，与“数字记忆”进行提问和互动。
- **情感化语音回复**: 所有回答都以克隆后的、充满温度的真实声音进行播放。

## 💻 技术栈 (Tech Stack)

| 类别             | 技术                         | 用途                               |
| :--------------- | :--------------------------- | :--------------------------------- |
| **前端**         | React                        | 构建响应式的用户界面               |
| **后端与数据库** | Firebase                     | 提供用户认证、文件存储和数据库服务 |
| **无服务器函数** | Cloud Functions for Firebase | 编排和处理所有后端 AI 逻辑         |
| **语音转文字**   | AssemblyAI API               | 高精度地将上传的音频转录为文本     |
| **文本分析**     | OpenAI API (GPT-4o)          | 理解并分析转录文本，生成对话内容   |
| **声音克隆/TTS** | ElevenLabs API               | 创建逼真的声音克隆并合成语音       |

## 🚀 如何在本地运行

1.  克隆本仓库: `git clone https://github.com/your-repo/echoes-of-us.git`
2.  进入项目目录: `cd echoes-of-us`
3.  安装依赖: `npm install`
4.  配置环境变量: 创建一个 `.env.local` 文件，并填入以下 API 密钥：
    ```
    REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
    REACT_APP_OPENAI_API_KEY=your_openai_api_key
    # ... 其他需要的密钥
    ```
5.  启动项目: `npm start`

## 🎯 参赛赛道 (Targeted Tracks)

- All We Do 何以为人 (主题)
- 光速光合 - 如果记忆能说话，请让我们听到它的声音
- 元光科技 - 赛博乡愁：AI 重构地域文化密码
- 探月学校 - 一小步：学习的再发明
- 科技向善 Oneness AI - 爱 vs. AI? 硅基 vs. 碳基? 心 vs. 芯？
- FinalRound AI - Work Re-Imagined
- ... (其他相关赛道)

## 👥 团队成员 (Our Team)

- [你的名字] - 产品经理 & 主讲人
- [队员 A] - 前端开发
- [队员 B] - 后端 & AI 集成
- ...

---

**#AdventureX2025 #夏天属于黑客松**
