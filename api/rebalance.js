export default function handler(req, res) {
  const q = req.query;

  // API KEY POR URL
  const key = q.apiKey;

  const VALID_KEYS = [
    "08cKe74qjP1MnDuNYr6cCeOxc71O",
    "FzE4IhjLpf55JglPkWPJJi4BuKqj",
    "9016"
  ];

  if (!key || !VALID_KEYS.includes(key)) {
    return res.status(403).json({
      result: "ERROR - Prohibido - Favor de contactar a @luc_m"
    });
  }

  const basePrice = Number(q.basePrice);
  if (!basePrice || basePrice <= 0) {
    return res.status(400).json({
      error: "basePrice is required"
    });
  }

  const sensitivity = Number(q.sensitivity ?? 0.5);
  const minMultiplier = Number(q.minMultiplier ?? 0.8);
  const maxMultiplier = Number(q.maxMultiplier ?? 1.2);

  const items = [];
  let i = 1;
  while (q[`item${i}_price`] && q[`item${i}_purchases`]) {
    items.push({
      item: i,
      price: Number(q[`item${i}_price`]),
      purchases: Number(q[`item${i}_purchases`])
    });
    i++;
  }

  if (!items.length) {
    return res.status(400).json({ error: "No items provided" });
  }

  const totalPurchases = items.reduce((s, it) => s + it.purchases, 0);
  const equilibrium = 1 / items.length;

  const result = items.map(it => {
    if (totalPurchases === 0) {
      return { item: it.item, newPrice: it.price };
    }

    const proportion = it.purchases / totalPurchases;
    const targetFactor = 1 + sensitivity * (proportion - equilibrium);

    const currentFactor = it.price / basePrice;
    const smoothed =
      currentFactor + (targetFactor - currentFactor) * 0.5;

    const finalFactor = Math.min(
      maxMultiplier,
      Math.max(minMultiplier, smoothed)
    );

    return {
      item: it.item,
      newPrice: Number((basePrice * finalFactor).toFixed(2))
    };
  });

  res.status(200).json({ items: result });
}
