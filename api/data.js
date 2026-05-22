export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const ticker = searchParams.get("t") || "AAPL";

    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/" +
      encodeURIComponent(ticker) +
      "?range=1y&interval=1d";

    const r = await fetch(url);
    const j = await r.json();

    if (
      !j.chart ||
      !j.chart.result ||
      !j.chart.result[0] ||
      !j.chart.result[0].indicators ||
      !j.chart.result[0].indicators.quote ||
      !j.chart.result[0].indicators.quote[0]
    ) {
      return res.status(500).json({ error: "no data" });
    }

    const result = j.chart.result[0];
    const rawClose = result.indicators.quote[0].close || [];

    const close = rawClose.filter(v => typeof v === "number" && isFinite(v));

    if (close.length < 40) {
      return res.status(500).json({ error: "not enough data" });
    }

    const meta = result.meta || {};

    const name = meta.longName || meta.shortName || ticker;
    const exchange = meta.exchangeName || meta.exchange || "Unknown";

    res.status(200).json({
      close,
      name,
      exchange
    });

  } catch (e) {
    res.status(500).json({ error: "fail" });
  }
}
