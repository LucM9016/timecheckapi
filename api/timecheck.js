export default function handler(req, res) {
  const { time, key, nextDay } = req.query;
  // Lista de claves válidas
  const VALID_KEYS = ["08cKe74qjP1MnDuNYr6cCeOxc71O", "FzE4IhjLpf55JglPkWPJJi4BuKqjX", "9016"];
  
  // Verificar la clave API
  if (!VALID_KEYS.includes(key)) {
    return res.status(403).json({ result: "ERROR - Prohibido - Favor de contactar a @luc_m" });
  }
  
  // Verificar si la variable 'time' está presente
  if (!time) {
    return res.status(400).json({ result: "ERROR - Parámetro 'time' es requerido" });
  }
  
  // Verificar el formato de la hora (ahora permite números de un solo dígito sin ceros iniciales)
  const match = time.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (!match) {
    return res.status(400).json({ 
      result: "ERROR - Formato de tiempo inválido. Use HH:MM:SS",
      receivedTime: time
    });
  }
  
  // Parsear los componentes de tiempo
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const second = parseInt(match[3], 10);
  
  // Validar los rangos de horas, minutos y segundos
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return res.status(400).json({ 
      result: "ERROR - Valores de tiempo fuera de rango. Horas(0-23), Minutos(0-59), Segundos(0-59)"
    });
  }
  
  // Comprobar si nextDay está establecido a true (acepta 'true', '1', 'yes')
  const isNextDay = nextDay === 'true' || nextDay === '1' || nextDay === 'yes';
  
  // Usando directamente Date.now() para evitar problemas con zonas horarias del servidor
  const nowMs = Date.now();
  
  // Obtener fecha actual en CDMX (UTC-6)
  // Crear la fecha de hoy en UTC
  const nowUtc = new Date(nowMs);
  
  // Ajustar a CDMX (UTC-6)
  // 1. Obtener la fecha en UTC
  const year = nowUtc.getUTCFullYear();
  const month = nowUtc.getUTCMonth();
  const day = nowUtc.getUTCDate();
  const currentHour = nowUtc.getUTCHours();
  const currentMinute = nowUtc.getUTCMinutes();
  const currentSecond = nowUtc.getUTCSeconds();
  
  // 2. Aplicar el offset de CDMX (-6 horas desde UTC)
  let cdmxHour = currentHour - 6;
  let cdmxDay = day;
  let cdmxMonth = month;
  let cdmxYear = year;
  
  // Ajustar si la hora se vuelve negativa (cambio de día hacia atrás)
  if (cdmxHour < 0) {
    cdmxHour += 24;
    const previousDay = new Date(Date.UTC(year, month, day - 1));
    cdmxDay = previousDay.getUTCDate();
    cdmxMonth = previousDay.getUTCMonth();
    cdmxYear = previousDay.getUTCFullYear();
  }
  
  // Crear objeto Date para la hora actual en CDMX
  const cdmxNow = new Date(Date.UTC(cdmxYear, cdmxMonth, cdmxDay, cdmxHour, currentMinute, currentSecond));
  
  // Crear objeto Date para la hora objetivo en CDMX
  const targetDate = new Date(Date.UTC(cdmxYear, cdmxMonth, cdmxDay, hour, minute, second));
  
  // Si es para el siguiente día, ajustar la fecha
  if (isNextDay) {
    targetDate.setUTCDate(targetDate.getUTCDate() + 1);
  } else {
    // Si la hora objetivo es anterior a la hora actual y no se especificó nextDay,
    // asumimos que queremos comprobar si ya pasó hoy
    if (targetDate < cdmxNow) {
      // Ya pasó hoy
      return res.status(200).json({ 
        result: true,
        current_time: `${cdmxHour}:${currentMinute}:${currentSecond}`,
        target_time: `${hour}:${minute}:${second}`
      });
    }
  }
  
  // Si el tiempo ya pasó, devuelve true
  if (targetDate <= cdmxNow) {
    return res.status(200).json({ 
      result: true,
      current_time: `${cdmxHour}:${currentMinute}:${currentSecond}`,
      target_time: `${hour}:${minute}:${second}`
    });
  } else {
    // Si el tiempo aún no ha llegado, calcula cuánto falta
    const diff = targetDate - cdmxNow; // Diferencia en milisegundos
    const remainingSeconds = Math.floor(diff / 1000);
    
    // Calcular componentes de tiempo restante
    const daysLeft = Math.floor(remainingSeconds / 86400);
    const hoursLeft = Math.floor((remainingSeconds % 86400) / 3600);
    const minutesLeft = Math.floor((remainingSeconds % 3600) / 60);
    const secondsLeft = remainingSeconds % 60;
    
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
      remaining: remainingTime,
      current_time: `${cdmxHour}:${currentMinute}:${currentSecond}`,
      target_time: `${hour}:${minute}:${second}`
    });
  }
}
