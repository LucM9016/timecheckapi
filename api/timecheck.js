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
    return res.status(400).json({ error: "Parámetro 'time' es requerido" });
  }
  
  // Depuración: verificar el formato que está llegando
  console.log("Formato recibido:", time);
  
  // El problema puede estar en cómo se maneja el caracter '/' en la URL
  // La expresión regular necesita ser más flexible
  let nextDay = false;
  let cleanTime = time;
  
  // Comprobar si contiene /+1 en cualquier forma que pueda venir codificado en la URL
  if (time.includes('/+1') || time.includes('%2F%2B1') || time.includes('%2F+1')) {
    nextDay = true;
    // Limpiar el tiempo de cualquier variante de /+1
    cleanTime = time.replace(/\/\+1|%2F%2B1|%2F\+1/g, '');
  }
  
  // Verificar el formato de la hora básica
  const match = cleanTime.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (!match) {
    return res.status(400).json({ 
      error: "Formato de tiempo inválido. Use HH:MM:SS o HH:MM:SS/+1",
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
      error: "Valores de tiempo fuera de rango. Horas(0-23), Minutos(0-59), Segundos(0-59)"
    });
  }
  
  // Obtener la fecha y hora actual en CDMX (UTC-6)
  const now = new Date();
  
  // Ajustar a la zona horaria de CDMX (UTC-6)
  const cdmxOffset = -6 * 60; // CDMX está en UTC-6 (en minutos)
  const utcOffset = now.getTimezoneOffset(); // Diferencia entre hora local del servidor y UTC (en minutos)
  const totalOffset = utcOffset + cdmxOffset; // Diferencia total a aplicar
  
  // Crear la fecha actual ajustada a CDMX
  const cdmxNow = new Date(now.getTime() + totalOffset * 60 * 1000);
  
  // Crear la fecha objetivo en CDMX
  const target = new Date(
    cdmxNow.getFullYear(),
    cdmxNow.getMonth(),
    cdmxNow.getDate(),
    hour,
    minute,
    second
  );
  
  // Si es para el siguiente día, ajusta la fecha
  if (nextDay) {
    target.setDate(target.getDate() + 1);
  }
  
  // Si el tiempo ya pasó, devuelve true
  if (target <= cdmxNow) {
    return res.status(200).json({ result: true });
  } else {
    // Si el tiempo aún no ha llegado, calcula cuánto falta
    const diff = target - cdmxNow; // Diferencia en milisegundos
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
      remaining: remainingTime
    });
  }
}
