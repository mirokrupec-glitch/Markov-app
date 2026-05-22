export default async function handler(req, res) {
  try {
    const ticker = String(req.query.t || "AAPL").trim().toUpperCase();

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

    const rawClose = result?.indicators?.quote?.[0]?.close || [];

    const close = rawClose.filter(
      v => typeof v === "number" && Number.isFinite(v)
    );

    if (close.length < 40) {
      return res.status(422).json({ error: "not enough data" });
    }

    const meta = result.meta || {};

    res.status(200).json({
      ticker,
      close,
      name: meta.longName || meta.shortName || ticker,
      exchange: meta.exchangeName || meta.exchange || "Unknown"
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server fail" });
  }
}
