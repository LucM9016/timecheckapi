export default function handler(req, res) {
  const { time } = req.query;

  if (!time) {
    return res.status(400).json({ result: false });
  }

  const regex = /^(\d{1,2}):(\d{1,2}):(\d{1,2})(\/\+1)?$/;
  const match = time.match(regex);
  if (!match) return res.json({ result: false });

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const second = parseInt(match[3], 10);
  const nextDay = !!match[4];

  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    second
  );

  if (nextDay) {
    target.setDate(target.getDate() + 1);
  }

  res.setHeader('Content-Type', 'application/json');
  res.json({ result: target > now });
}
