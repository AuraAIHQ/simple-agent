# simple-agent
An agent by myself, for myself, step by step.
## Agent 到底是什么

  大家说"Agent"的时候其实在说三种完全不同的东西，经常混淆：

  Level 1：规则 Agent
    if 收到文件 → 存到磁盘 → 回复"已保存"
    没有 LLM，没有推理，就是代码逻辑
    ← 你说的"文件存储 agent"就是这个

  Level 2：LLM Agent（对话机器人）
    用 LLM 理解输入 → 生成回复
    依赖 API Key（Claude/OpenAI）或本地模型（Ollama）
    ← 大多数人说的聊天机器人

  Level 3：Agentic LLM（自主执行）
    LLM + 工具调用 + 多步推理
    可以搜网页、写文件、执行代码
    ← Claude Code 本身就是这个
## So, I create step by step

---

## 当前包：`@aura/simple-agent`

包含若干实现 [WeChat Agent 接口](https://github.com/mason0510/wechat-agent-bridge) 的"简单 agent"。第一版只有一个 — `StorageAgent`。

### StorageAgent

Level 1 规则型 agent。把微信收到的图片、视频、语音、文件、文字按"用户/日期"归档到本地磁盘。**不依赖任何 LLM**，纯代码逻辑，零 API Key。

**典型场景**：在一台 24/7 运行的 Mac mini 上跑，相当于一个"永远在线的微信文件助手"——朋友发文件给你的 bot 微信号，自动存到指定目录。

#### 用法

```ts
import { StorageAgent } from "@aura/simple-agent";
import { WeChatInterface } from "@agent-wechat/core";

const agent = new StorageAgent({
  basePath: "~/Documents/wechat-storage",
  saveText: true,
});

const wechat = new WeChatInterface({ agent });
await wechat.login();   // 一次性扫码
await wechat.start();   // 进入消息循环
```

#### 配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basePath` | `string` | `~/.simple-agent/storage` | 文件存储根目录，支持 `~` 展开 |
| `saveText` | `boolean` | `true` | 是否把纯文本消息存到 `messages.txt` |

#### 文件布局

```
{basePath}/
└── {conversationId}/             用户微信 ID（消毒过的安全字符串）
    └── {YYYY-MM-DD}/             按日期分目录
        ├── 142312-3942-photo.jpg 时间戳-计数器-原文件名
        ├── 143005-0123-doc.pdf
        └── messages.txt          当日所有文本消息（按行）
```

`messages.txt` 每行格式：`[HH:mm:ss] 文本内容`。

#### 行为约定

- 收到媒体 → 复制到目标路径（**不删除原文件**）→ 回复 `✅ 已保存 [type] filename`
- 收到文本（且 saveText=true）→ append 到当日 `messages.txt` → 回复 `📝 文本已记录`
- 出错 → 回复 `⚠️ 存储失败：{原因}`

## 路线图

- [x] StorageAgent — 文件归档（当前版本）
- [ ] ReminderAgent — 文字记事，定时提醒
- [ ] LocalLLMAgent — 接 Ollama，本地推理对话

