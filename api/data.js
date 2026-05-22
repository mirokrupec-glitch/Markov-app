export default async function handler(req, res) {
  const t = req.query.t || "AAPL";

  try {
    const r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + t
    );
    const j = await r.json();
    const close = j.chart.result[0].indicators.quote[0].close;

    res.status(200).json(close);
  } catch (e) {
    res.status(500).json({ error: "fail" });
  }
}
