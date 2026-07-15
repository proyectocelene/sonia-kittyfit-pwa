/* ==========================================================================
   SONIA KITTYFIT - STATE, CONSTANTS & OFFLINE DATABASE (state.js)
   ========================================================================== */

const defaultSoniaData = {
  profile: {
    name: "SONIA RAMIREZ CORRAL",
    age: 27,
    height: 176,
    initialWeight: 80.0,
    targetWeight: 68.1,
    initialFatPercentage: 31.8,
    targetCaloriesBase: 1706, // PDF Target Base calories
    targetProteinBase: 113,
    targetCarbsBase: 214,
    targetFatBase: 62,
    waterTarget: 2.6,
    deepseekApiKey: "",
    pantry: [
      "huevos", "claras de huevo", "tortillas de maíz", "pechuga de pollo", 
      "atún en agua", "arroz cocido", "avena", "espinaca", "aguacate", 
      "leche descremada", "yogurt natural", "manzana", "queso panela", 
      "champiñones", "lechuga", "jitomate", "almendras", "frijoles"
    ],
    canGoToStore: true,
    foodBudget: "Medio",
    weightUnit: "kg"
  },
  
  dietPlan: {
    Lunes: [
      { name: "Desayuno", description: "Huevo Revuelto con Espinacas: Cocina 2 claras y 1 huevo entero con 2 tazas de espinacas al vapor. Acompaña con 2 tortillas de maíz asadas y 1/3 de aguacate Hass. 1 vaso de leche descremada.", kcal: 450, p: 32, c: 45, g: 16 },
      { name: "Colación Matutina", description: "Snack de Fruta con Semillas: 1 manzana mediana picada con 10 almendras enteras o 3 nueces.", kcal: 180, p: 4, c: 22, g: 8 },
      { name: "Comida", description: "Plato de Fuerza: 120g de pechuga de pollo asada a la plancha. Acompaña con 1/2 taza de arroz integral al vapor y ensalada de lechuga con pepino y jitomate. 1 cdita de aceite de oliva.", kcal: 550, p: 38, c: 55, g: 15 },
      { name: "Colación Vespertina", description: "Verdura Cruda con Limón: Bastones de pepino y jícama con jugo de limón y una pizca de sal marina.", kcal: 80, p: 1, c: 18, g: 0 },
      { name: "Cena", description: "Quesadillas de Panela: 2 tortillas de maíz dobladas con 40g de queso panela asado y hojas de espinaca en el interior.", kcal: 446, p: 38, c: 74, g: 23 }
    ],
    Martes: [
      { name: "Desayuno", description: "Licuado (1 taza de leche descremada, ⅓ taza de avena, 1 taza de fresas, 10 almendras) + Sándwich (1 rebanada de pan integral, 90g de queso panela, lechuga y jitomate, 1 cdita mayonesa baja en grasa).", kcal: 470, p: 35, c: 50, g: 15 },
      { name: "Colación Matutina", description: "¾ taza de yogurt natural con 1 taza de sandía y 5 almendras.", kcal: 180, p: 8, c: 30, g: 4 },
      { name: "Comida", description: "120g de bistec de res magro. 1 taza de lentejas cocidas. 3 tortillas de maíz. 1 taza de calabaza cocida salteada con 2 cditas de aceite.", kcal: 710, p: 44, c: 75, g: 22 },
      { name: "Colación Vespertina", description: "1 pera mediana con 14 cacahuates sin sal.", kcal: 170, p: 5, c: 22, g: 8 },
      { name: "Cena", description: "Rollitos de jamón (8 rebanadas de jamón de pavo) con ensalada de champiñones salteados (2 tazas con ½ taza zanahoria, 1 cdita aceite). 2 rebanadas pan tostado integral.", kcal: 326, p: 33, c: 42, g: 16 }
    ],
    Miércoles: [
      { name: "Desayuno", description: "Omelet de champiñones (1 huevo + 4 claras, 2 tazas de champiñones, 2 cditas de aceite). 2 tortillas. 1 taza de melón. 1 taza de leche descremada.", kcal: 450, p: 32, c: 45, g: 16 },
      { name: "Colación Matutina", description: "¾ taza de yogurt natural con 2 duraznos chicos.", kcal: 170, p: 7, c: 31, g: 2 },
      { name: "Comida", description: "120g de filete de pescado empapelado. ½ taza de garbanzos. ½ taza de pasta cocida y 1 tortilla. 1 taza de chayote cocido y ½ taza de zanahoria con 2 cditas de aceite de oliva.", kcal: 546, p: 36, c: 70, g: 14 },
      { name: "Colación Vespertina", description: "10 uvas con 10 almendras.", kcal: 140, p: 3, c: 17, g: 7 },
      { name: "Cena", description: "Quesadillas (2 tortillas de maíz, 120g de pechuga de pollo deshebrada). Ensalada de lechuga (2 tazas) con pico de gallo y ¼ de aguacate.", kcal: 400, p: 35, c: 51, g: 23 }
    ],
    Jueves: [
      { name: "Desayuno", description: "90g de pechuga de pollo en salsa verde. 2 tortillas. 1 taza de nopales cocidos. ¼ de aguacate. 1 manzana. 1 taza de leche descremada.", kcal: 440, p: 33, c: 48, g: 13 },
      { name: "Colación Matutina", description: "¾ taza de yogurt natural con 1 taza de piña picada.", kcal: 180, p: 7, c: 34, g: 2 },
      { name: "Comida", description: "120g de lomo de cerdo magro. ½ taza de frijoles. 3 tortillas de maíz. 2 tazas de brócoli cocido salteado con 2 cditas de aceite. Ensalada de lechuga con 1/8 aguacate.", kcal: 700, p: 45, c: 76, g: 22 },
      { name: "Colación Vespertina", description: "1 taza de papaya con 14 cacahuates.", kcal: 170, p: 5, c: 22, g: 8 },
      { name: "Cena", description: "Ensalada fresca (3 tazas lechuga, ½ taza jitomate, 120g de atún en agua, ½ taza de coditos cocidos, 1 cdita de aceite). 4 galletas habaneras.", kcal: 366, p: 35, c: 39, g: 20 }
    ],
    Viernes: [
      { name: "Desayuno", description: "Huevos estrellados (1 huevo + 4 claras) con 2 cditas de aceite. 2 rebanadas de pan integral. Ensalada de espinaca (2 tazas). 1 naranja en gajos. 1 taza de leche descremada.", kcal: 460, p: 33, c: 46, g: 16 },
      { name: "Colación Matutina", description: "¾ taza de yogurt natural con 10 uvas.", kcal: 150, p: 7, c: 26, g: 2 },
      { name: "Comida", description: "120g de puntas de res magras. ½ taza de lenteijas. 1 taza de calabaza cocida. 2 tortillas. ¼ de aguacate.", kcal: 576, p: 38, c: 68, g: 16 },
      { name: "Colación Vespertina", description: "1 manzana con 10 almendras.", kcal: 150, p: 3, c: 24, g: 6 },
      { name: "Cena", description: "Salpicón de pollo (120g de pollo deshebrado, 2 tazas de lechuga, ½ taza de rábano, 1 cdita de aceite). 2 tostadas horneadas.", kcal: 370, p: 32, c: 50, g: 22 }
    ],
    Sábado: [
      { name: "Desayuno", description: "Avena cocida (¾ taza avena en agua, 1 taza leche descremada, ½ plátano, 10 almendras) + Omelet de claras (6 claras, 2 tazas de flor de calabaza o champiñones, 1 cdita de aceite). 1 tortilla.", kcal: 490, p: 36, c: 54, g: 15 },
      { name: "Colación Matutina", description: "¾ taza de yogurt natural con 1 taza de fresas.", kcal: 150, p: 7, c: 26, g: 2 },
      { name: "Comida", description: "120g de filete de pescado a la plancha. ½ taza de habas cocidas. 1.5 tazas de arroz cocido. 1 taza de brócoli con 2 cditas de aceite de oliva.", kcal: 680, p: 44, c: 80, g: 18 },
      { name: "Colación Vespertina", description: "1 taza de papaya con 14 cacahuates.", kcal: 170, p: 5, c: 22, g: 8 },
      { name: "Cena", description: "Sándwich de pavo (2 rebanadas pan integral, 8 rebanadas jamón de pavo, espinaca/jitomate al gusto, ¼ de aguacate).", kcal: 366, p: 33, c: 37, g: 24 }
    ],
    Domingo: [
      { name: "Desayuno", description: "Huevos a la mexicana (1 huevo + 4 claras, 1 taza de jitomate/cebolla) cocinados con 2 cditas de aceite. 2 tortillas. 1 taza de papaya. 1 taza de leche descremada.", kcal: 450, p: 32, c: 45, g: 16 },
      { name: "Colación Matutina", description: "¾ taza de yogurt natural con 1 pera.", kcal: 180, p: 7, c: 34, g: 2 },
      { name: "Comida", description: "120g de carne molida de res magra (en albóndigas). ½ taza de frijoles. 1 taza de sopa de fideo cocido. 1 taza de ejotes cocidos. 2 cditas de aceite.", kcal: 576, p: 37, c: 70, g: 16 },
      { name: "Colación Vespertina", description: "1 taza de melón con 10 almendras.", kcal: 140, p: 3, c: 17, g: 7 },
      { name: "Cena", description: "120g de queso panela asado. 1 taza de nopales asados y 1 taza de chayote cocido. 2 tortillas de maíz. ¼ de aguacate.", kcal: 360, p: 34, c: 48, g: 21 }
    ]
  },

  mealPortions: {
    Desayuno: { verduras: 1, frutas: 1, cereales: 1, animal: 3, leguminosas: 0, grasas: 1, leche: 1.5, cerealesGrasa: 0, grasasProteina: 0 },
    ColaciónMatutina: { verduras: 0, frutas: 1, cereales: 0, animal: 0, leguminosas: 0, grasas: 0, leche: 0, cerealesGrasa: 1, grasasProteina: 1 },
    Comida: { verduras: 2, frutas: 0, cereales: 2, animal: 4, leguminosas: 1.5, grasas: 2, leche: 0, cerealesGrasa: 0, grasasProteina: 0 },
    ColaciónVespertina: { verduras: 0, frutas: 1, cereales: 0, animal: 0, leguminosas: 0, grasas: 0, leche: 0, cerealesGrasa: 0, grasasProteina: 0 },
    Cena: { verduras: 2, frutas: 1, cereales: 1.5, animal: 2, leguminosas: 0, grasas: 1, leche: 0, cerealesGrasa: 0, grasasProteina: 0 }
  },

  smaeTargets: [
    { key: "cereales", name: "Carbohidratos sin grasa", target: 4.5, unit: "ración" },
    { key: "verduras", name: "Verduras", target: 5, unit: "ración" },
    { key: "frutas", name: "Frutas", target: 4, unit: "ración" },
    { key: "animal", name: "Proteína Baja en Grasa", target: 9, unit: "ración" },
    { key: "leguminosas", name: "Leguminosas", target: 1.5, unit: "ración" },
    { key: "leche", name: "Lácteos Descremados", target: 1.5, unit: "vaso" },
    { key: "grasas", name: "Grasas Saludables", target: 4, unit: "cdita" },
    { key: "cerealesGrasa", name: "Carbohidratos con grasa", target: 1, unit: "ración" },
    { key: "grasasProteina", name: "Grasas con proteína", target: 1, unit: "ración" }
  ],

  exchangesDB: {
    cereales: [
      "1 pza Tortilla de maíz",
      "1/2 tz Arroz o pasta cocida",
      "1/3 tz Avena cruda",
      "2 pzas Tostadas horneadas"
    ],
    verduras: [
      "1 tz Espinaca cruda",
      "1/2 tz Calabacita cocida",
      "1 tz Pepino con cáscara",
      "1/2 tz Chayote cocido"
    ],
    frutas: [
      "1 pza Manzana o Naranja",
      "1 tz Papaya o Melón picado",
      "1/2 pza Plátano mediano",
      "15 pzas Uvas chicas"
    ],
    animal: [
      "30g Pechuga de pollo o filete de res",
      "1 pza Huevo entero o 2 claras",
      "40g Queso panela fresco",
      "1/3 tz Atún en agua"
    ],
    leguminosas: [
      "1/2 tz Frijoles de la olla",
      "1/2 tz Lentejas cocidas",
      "1/2 tz Garbanzos cocidos"
    ],
    leche: [
      "1 vaso Leche descremada (250ml)",
      "3/4 tz Yogurt griego natural sin azúcar",
      "1 tz Kéfir natural descremado"
    ],
    grasas: [
      "1/3 pza Aguacate Hass",
      "1 cdita Aceite de oliva o canola",
      "5 bastoncitos de coco fresco"
    ],
    cerealesGrasa: [
      "3 cdas Granola con frutas",
      "1/2 barra de avena comercial"
    ],
    grasasProteina: [
      "10 pzas Almendras enteras",
      "3 pzas Nueces enteras",
      "10 cacahuates sin sal"
    ]
  },

  workoutRoutines: [], // Array of user-defined routines: { id, name, exercises: [] }

  history: [
    { date: "2026-07-09", weight: 80.0, fat: 31.8, hr: 74, workoutDone: "none", calories: 1500, water: 2.0, compliance: 1, feeling: "Servicio Social pesado", notes: "Mucho café", smaeOffsets: {}, workoutLogged: {} }
  ],
  
  currentWeights: {}, // Stores last weight used per exercise ID for progressive overload
  currentUnits: {},
  machineImages: {},
  chatHistory: []
};

const passiveQuotes = [
  "¿A ver, Sonia, cuántas toneladas pesaste hoy? Digo, kilos... 🎀",
  "¡Ese sillón de tu servicio social no va a quemar tu grasa solo! ¡Levántate!",
  "Menos chilaquiles de centro de salud y más sentadillas, Sonia. ¡Muévete!",
  "¿Ya fuiste a entrenar o vas a poner de excusa que saliste tarde de consulta de nuevo?",
  "A ver, médica, ¿curamos pacientes o acumulamos raciones? ¡A mover el esqueleto!",
  "El agua no muerde, reina. Tómate un vaso. Meta: 10 vasos.",
  "¿Hoy toca Día Alto y ya estás pensando en tacos de pastor? Te estoy vigilando... 🕵️‍♀️",
  "¡Qué linda te ves comiendo tu lechuga! Ahora ve a hacer flexiones.",
  "Un día sin entrenar es un día más siendo íntima amiga de las galletas del centro de salud.",
  "¿31.8% de grasa corporal? Bueno, al menos flotas más fácil si te caes al agua... ¡Entrena fuerza!",
  "1506 calorías no son negociables hoy. Deja el pan integral en paz.",
  "¿Hiciste ejercicio o tu único cardio hoy fue correr a ver si ya llegó el paciente de las 12?"
];

// Mount everything on the global window namespace
window.defaultSoniaData = defaultSoniaData;
window.passiveQuotes = passiveQuotes;

window.appState = null;
window.currentDay = "Lunes";
window.activeRoutineTab = "A";
window.activeTab = "dashboard";

window.weightChartInstance = null;
window.hrChartInstance = null;
window.wakeLockObj = null;
window.confirmCallback = null;

const dbName = "SoniaKittyFitDB";
const storeName = "machinePhotos";
window.cachedMachineImages = {};

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

window.saveMachinePhoto = async function(exId, base64) {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(base64, exId);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("IndexedDB save error: ", err);
  }
};

window.getMachinePhoto = async function(exId) {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(exId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB read error: ", err);
    return null;
  }
};

window.loadAllMachineImages = async function() {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const keysRequest = store.getAllKeys();
    const keys = await new Promise((res, rej) => {
      keysRequest.onsuccess = () => res(keysRequest.result);
      keysRequest.onerror = () => rej(keysRequest.error);
    });
    
    window.cachedMachineImages = {};
    for (const key of keys) {
      window.cachedMachineImages[key] = await window.getMachinePhoto(key);
    }
  } catch (err) {
    console.error("Error caching machine images:", err);
  }
};

window.exerciseDatabase = {
  "Pierna": [
    "Sentadilla Libre", "Sentadilla Smith", "Prensa de Piernas", 
    "Extensión de Cuádriceps", "Curl de Isquios (Acostado)", 
    "Curl de Isquios (Sentado)", "Desplantes con Mancuernas",
    "Desplantes Búlgaros", "Hack Squat"
  ],
  "Glúteo": [
    "Hip Thrust (Barra)", "Puente de Glúteo", "Abducción de Cadera en Máquina",
    "Patada de Glúteo (Cable)", "Patada de Glúteo (Máquina)", 
    "Peso Muerto Rumano", "Sentadilla Sumo"
  ],
  "Pecho": [
    "Press de Banca Plano", "Press Inclinado con Mancuernas", 
    "Aperturas con Mancuernas", "Peck Deck (Máquina)", 
    "Press de Pecho en Máquina"
  ],
  "Espalda": [
    "Jalón al Pecho", "Remo con Barra", "Remo Sentado (Cable)", 
    "Remo con Mancuerna", "Dominadas (Asistidas)", "Pull Over (Cable)"
  ],
  "Hombro": [
    "Press Militar (Mancuernas)", "Press de Hombro (Máquina)", 
    "Elevaciones Laterales", "Elevaciones Frontales", "Face Pull"
  ],
  "Brazo": [
    "Curl de Bíceps (Barra Z)", "Curl con Mancuernas Alterno",
    "Curl Martillo", "Extensión de Tríceps (Cuerda)",
    "Press Francés", "Fondos de Tríceps (Máquina)"
  ],
  "Core/Cardio": [
    "Crunch Abdominal", "Plancha", "Elevación de Piernas Colgada",
    "Caminadora", "Elíptica", "Escaladora"
  ]
};

window.initAppState = function() {
  const savedState = localStorage.getItem("sonia_kittyfit_state");
  if (savedState) {
    try {
      window.appState = JSON.parse(savedState);
      
      // Auto upgrade keys
      Object.keys(defaultSoniaData).forEach(key => {
        if (window.appState[key] === undefined) {
          window.appState[key] = JSON.parse(JSON.stringify(defaultSoniaData[key]));
        }
      });
      
      Object.keys(defaultSoniaData.profile).forEach(key => {
        if (window.appState.profile[key] === undefined) {
          window.appState.profile[key] = defaultSoniaData.profile[key];
        }
      });


      
    } catch (e) {
      console.error("Error loading saved state, resetting.", e);
      window.appState = JSON.parse(JSON.stringify(defaultSoniaData));
    }
  } else {
    window.appState = JSON.parse(JSON.stringify(defaultSoniaData));
  }
  
  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const todayIndex = new Date().getDay();
  window.currentDay = daysOfWeek[todayIndex];

  window.initTodayLog();
  
  // Legacy image migrator
  if (window.appState.machineImages && Object.keys(window.appState.machineImages).length > 0) {
    Object.keys(window.appState.machineImages).forEach(async (key) => {
      await window.saveMachinePhoto(key, window.appState.machineImages[key]);
    });
    delete window.appState.machineImages;
  }
  
  window.saveState();
};

window.saveState = function() {
  localStorage.setItem("sonia_kittyfit_state", JSON.stringify(window.appState));
};

window.getTodayDateString = function() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

window.initTodayLog = function() {
  const todayStr = window.getTodayDateString();
  let todayLog = window.appState.history.find(h => h.date === todayStr);
  
  if (!todayLog) {
    const lastLog = window.appState.history[window.appState.history.length - 1] || { weight: 80.0, fat: 31.8, hr: 72 };
    
    todayLog = {
      date: todayStr,
      weight: lastLog.weight,
      fat: lastLog.fat !== undefined ? lastLog.fat : 31.8,
      hr: lastLog.hr,
      workoutDone: "none",
      calories: 0,
      protein: 0,
      carbs: 0,
      fatEaten: 0,
      water: 0,
      mealsCompleted: [],
      smaeEaten: { cereales: 0, verduras: 0, frutas: 0, animal: 0, leguminosas: 0, leche: 0, grasas: 0, cerealesGrasa: 0, grasasProteina: 0 },
      workoutLogged: {},
      feeling: "",
      notes: "",
      smaeOffsets: {}
    };
    window.appState.history.push(todayLog);
  }
  
  if (!todayLog.smaeEaten) todayLog.smaeEaten = { cereales: 0, verduras: 0, frutas: 0, animal: 0, leguminosas: 0, leche: 0, grasas: 0, cerealesGrasa: 0, grasasProteina: 0 };
  if (!todayLog.mealsCompleted) todayLog.mealsCompleted = [];
  if (!todayLog.workoutLogged) todayLog.workoutLogged = {};
  if (!todayLog.smaeOffsets) todayLog.smaeOffsets = {};
  if (todayLog.calories === undefined) todayLog.calories = 0;
  if (todayLog.protein === undefined) todayLog.protein = 0;
  if (todayLog.carbs === undefined) todayLog.carbs = 0;
  if (todayLog.fatEaten === undefined) todayLog.fatEaten = 0;
  if (todayLog.fat === undefined) todayLog.fat = 31.8;
  if (!todayLog.feeling) todayLog.feeling = "";
  if (!todayLog.notes) todayLog.notes = "";
};
