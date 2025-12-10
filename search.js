export default async function handler(req, res) {
  try {
    const image = req.body?.image;
    if (!image) return res.status(400).json({ error: "No image" });

    const response = await fetch("https://api.trace.moe/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: "Server error", details: e.toString() });
  }
}
