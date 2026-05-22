export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const ticker = searchParams.get("t") || "AAPL";

    const r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker
    );

    const j = await r.json();

    const result = j.chart.result[0];

    const close = result.indicators.quote[0].close;

    const meta = result.meta;

    const name = meta.longName || meta.shortName || ticker;
    const exchange = meta.exchangeName || "Unknown";

    res.status(200).json({
      close,
      name,
      exchange
    });

  } catch (e) {
    res.status(500).json({ error: "fail" });
  }
}
