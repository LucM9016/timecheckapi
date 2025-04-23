export default function handler(req, res) {
  const { time, key } = req.query;

  // Lista de claves válidas
  const VALID_KEYS = ["08cKe74qjP1MnDuNYr6cCeOxc71O", "FzE4IhjLpf55JglPkWPJJi4BuKqj", "9016"];

  if (!VALID_KEYS.includes(key)) {
    return res.status(403).json({ error: "Prohibido" });
  }

  if (!time) {
    return res.status(400).json({ result: false });
  }

  const match = time.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})(\/\+1)?$/);
  if (!match) {
    return res.status(400).json({ result: false });
  }

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

  const isFuture = target > now;

  if (isFuture) {
    return res.status(200).json({ result: true });
  } else {
    // Si el tiempo ya pasó, calcula cuánto falta
    const diff = now - target; // Diferencia en milisegundos
    const remainingSeconds = Math.abs(diff) / 1000;
    const minutesLeft = Math.floor(remainingSeconds / 60);
    const secondsLeft = Math.floor(remainingSeconds % 60);
    const hoursLeft = Math.floor(remainingSeconds / 3600);
    const daysLeft = Math.floor(remainingSeconds / 86400);

    // Generar el mensaje según el tiempo restante
    let remainingTime = '';
    
    if (daysLeft > 0) {
      remainingTime = `${daysLeft} días, ${hoursLeft} horas, ${minutesLeft} minutos y ${secondsLeft} segundos`;
    } else if (hoursLeft > 0) {
      remainingTime = `${hoursLeft} horas, ${minutesLeft} minutos y ${secondsLeft} segundos`;
    } else if (minutesLeft > 0) {
      remainingTime = `${minutesLeft} minutos y ${secondsLeft} segundos`;
    } else {
      remainingTime = `${secondsLeft} segundos`;
    }

    return res.status(200).json({
      result: false,
      remaining: remainingTime
    });
  }
}
