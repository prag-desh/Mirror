export default function handler(req, res) {
  return res.status(200).json({
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    keyPrefix: process.env.OPENROUTER_API_KEY
      ? process.env.OPENROUTER_API_KEY.slice(0, 6)
      : null
  });
}