export default function handler(req, res) {
  const { time, key } = req.query;

  // Lista de claves válidas
  const VALID_KEYS = ["08cKe74qjP1MnDuNYr6cCeOxc71O", "FzE4IhjLpf55JglPkWPJJi4BuKqj", "9016"];

  // Verificar la clave API
  if (!VALID_KEYS.includes(key)) {
    return res.status(403).json({ error: "Prohibido" });
  }

  // Verificar si la variable 'time' está presente
  if (!time) {
    return res.status(400).json({ result: false });
  }

  // Verificar el formato de la hora
  const match = time.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})(\/\+1)?$/);
  if (!match) {
    return res.status(400).json({ result: false });
  }

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const second = parseInt(match[3], 10);
  const nextDay = !!match[4];  // Si tiene '/+1', será true, sino false.

  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    second
  );

  // Si es para el siguiente día, ajusta la fecha
  if (nextDay) {
    target.setDate(target.getDate() + 1);
  }

  // Si la fecha es futura, devuelve true
  if (target > now) {
    return res.status(200).json({ result: true });
  } else {
    // Si ya pasó, calcula cuánto falta
    const diff = target - now; // Diferencia en milisegundos
    const remainingSeconds = Math.abs(diff) / 1000;
    const minutesLeft = Math.floor(remainingSeconds / 60);
    const secondsLeft = Math.floor(remainingSeconds % 60);
    const hoursLeft = Math.floor(remainingSeconds / 3600);
    const daysLeft = Math.floor(remainingSeconds / 86400);

    // Generar el mensaje según el tiempo restante
    let remainingTime = '';
    
    if (daysLeft > 0) {
      remainingTime = `${daysLeft} días, ${hoursLeft % 24} horas, ${minutesLeft % 60} minutos y ${secondsLeft} segundos`;
    } else if (hoursLeft > 0) {
      remainingTime = `${hoursLeft} horas, ${minutesLeft % 60} minutos y ${secondsLeft} segundos`;
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
