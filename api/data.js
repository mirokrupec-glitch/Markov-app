export default async function handler(req, res) {
  try {
    // ✅ správne čítanie parametra t
    const { searchParams } = new URL(req.url, "http://localhost");
    const ticker = searchParams.get("t") || "AAPL";

    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker
    );

    const data = await response.json();

    const close =
      data.chart.result[0].indicators.quote[0].close;

    res.status(200).json(close);

  } catch (err) {
    res.status(500).json({ error: "Data fetch error" });
  }
}
