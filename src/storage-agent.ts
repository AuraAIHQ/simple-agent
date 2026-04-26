import type { Agent, ChatRequest, ChatResponse } from "weixin-agent-sdk";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

export interface StorageAgentOptions {
  /** 文件保存的根目录。默认：~/.simple-agent/storage */
  basePath?: string;
  /** 是否同时保存纯文本消息到 messages.txt。默认 true */
  saveText?: boolean;
}

export class StorageAgent implements Agent {
  private readonly basePath: string;
  private readonly saveText: boolean;

  constructor(options: StorageAgentOptions = {}) {
    this.basePath = expandHome(options.basePath ?? "~/.simple-agent/storage");
    this.saveText = options.saveText ?? true;
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    try {
      const now = new Date();
      const safeId = sanitizeId(req.conversationId);
      const dateDir = path.join(this.basePath, safeId, formatDate(now));
      await fs.mkdir(dateDir, { recursive: true });

      if (req.media) {
        const rawName =
          req.media.fileName ?? path.basename(req.media.filePath);
        const safeName = sanitizeId(rawName);
        // 用 Date.now() 后 4 位作为同秒内的计数器，避免重名碰撞
        const counter = String(Date.now() % 10000).padStart(4, "0");
        const finalName = `${formatTime(now)}-${counter}-${safeName}`;
        const targetPath = path.join(dateDir, finalName);

        // 用 copyFile 而非 rename：原文件由 bridge 管理，不可移动
        await fs.copyFile(req.media.filePath, targetPath);

        const emoji = mediaEmoji(req.media.type);
        return {
          text: `✅ 已保存 ${emoji} [${req.media.type}] ${rawName}\n📁 ${targetPath}`,
        };
      }

      // 纯文本路径
      if (!this.saveText) {
        return { text: "📝 收到（已忽略，未启用文本存档）" };
      }

      const messagesFile = path.join(dateDir, "messages.txt");
      const text = req.text ?? "";
      // 含换行的引用文本：原样追加 + 空行分隔；单行文本走时间戳前缀格式
      const line = text.includes("\n")
        ? `[${formatTimeColon(now)}]\n${text}\n\n`
        : `[${formatTimeColon(now)}] ${text}\n`;
      await fs.appendFile(messagesFile, line, "utf8");

      return { text: "📝 文本已记录" };
    } catch (err) {
      const error = err as Error;
      console.error("[StorageAgent] chat failed:", error.stack ?? error);
      return { text: `⚠️ 存储失败：${error.message}` };
    }
  }
}

// ────────────────────────────────────────────────────────────
// 辅助函数
// ────────────────────────────────────────────────────────────

function expandHome(p: string): string {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

function sanitizeId(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]/g, "_");
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatTime(d: Date): string {
  return `${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function formatTimeColon(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function mediaEmoji(type: string): string {
  switch (type) {
    case "image":
      return "🖼️";
    case "video":
      return "🎬";
    case "audio":
      return "🎵";
    case "file":
      return "📄";
    default:
      return "📦";
  }
}
