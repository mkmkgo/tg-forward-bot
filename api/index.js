// Telegram多源群转发多目标群 - Vercel部署版
// 配置区（已填入你的参数，新增规则直接加行即可）
const BOT_TOKEN = "8791574924:AAEIa64CgRSD1dNoBQ2IcVAwPVJxLlQEe8k";
const FORWARD_RULES = {
  "-1002711944804": -1003886851926, // 你的源群1 → 目标群1
  // 新增转发规则示例（取消注释/新增行即可）：
  // "-1001234567890": -1009876543210, // 源群2 → 目标群2
};

// 核心处理逻辑
export default async function handler(req, res) {
  // 仅处理POST请求（Telegram Webhook固定为POST）
  if (req.method !== 'POST') {
    return res.status(404).end('仅支持POST请求');
  }

  try {
    const body = await req.json(); // 解析请求体
    const message = body.message || body.channel_post; // 兼容群组/频道消息

    // 过滤无效消息
    if (!message || !message.chat) {
      return res.status(200).send('OK');
    }

    const sourceChatId = String(message.chat.id); // 转字符串匹配规则
    // 检查是否有转发规则
    if (FORWARD_RULES[sourceChatId]) {
      const targetChatId = FORWARD_RULES[sourceChatId];
      // 调用Telegram转发API
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/forwardMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          from_chat_id: sourceChatId,
          message_id: message.message_id,
          disable_notification: true // 静默转发，避免目标群刷屏
        })
      });
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('转发失败:', err); // 日志便于排查问题
    return res.status(200).send('OK'); // 必须返回200，否则Telegram会重复推送
  }
}