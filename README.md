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
