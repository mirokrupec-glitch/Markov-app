export default async function handler(req, res) {
  try {
    let ticker = "AAPL";

    if (req.query && req.query.t) {
      ticker = req.query.t;
    } else {
      const { searchParams } = new URL(req.url, "http://localhost");
      ticker = searchParams.get("t") || "AAPL";
    }

    ticker = String(ticker).trim().toUpperCase();

    if (!ticker) {
      return res.status(400).json({ error: "missing ticker" });
    }

    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/" +
      encodeURIComponent(ticker) +
      "?range=1y&interval=1d";

    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!r.ok) {
      return res.status(502).json({
        error: "yahoo request failed",
        status: r.status
      });
    }

    const j = await r.json();
    const result = j?.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: "no data" });
    }

    const timestamps = result.timestamp || [];
    const rawClose = result?.indicators?.quote?.[0]?.close || [];

    const close = [];
    const dates = [];

    for (let i = 0; i < rawClose.length; i++) {
      const price = rawClose[i];
      const ts = timestamps[i];

      if (
        typeof price === "number" &&
        Number.isFinite(price) &&
        typeof ts === "number" &&
        Number.isFinite(ts)
      ) {
        close.push(price);
        dates.push(new Date(ts * 1000).toISOString().slice(0, 10));
      }
    }

    if (close.length < 40) {
      return res.status(422).json({ error: "not enough data" });
    }

    const meta = result.meta || {};

    return res.status(200).json({
      ticker,
      close,
      dates,
      name: meta.longName || meta.shortName || ticker,
      exchange: meta.exchangeName || meta.exchange || "Unknown"
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server fail" });
  }
}
