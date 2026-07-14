/* ==========================================================================
   SONIA KITTYFIT - CLINICAL CALCULATORS & API MATHS (api.js)
   ========================================================================== */

window.calculateBMI = function(weight, height) {
  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(1);
};

window.getBMICategory = function(bmi) {
  if (bmi < 18.5) return { text: "Bajo Peso 🌸", color: "badge-purple", tip: "Consulta para subir saludablemente, estás muy flaquita." };
  if (bmi < 25.0) return { text: "Peso Saludable 💖", color: "badge-yellow", tip: "¡Excelente! Estás en rango ideal. ¡No te descuides!" };
  if (bmi < 30.0) return { text: "Sobrepeso 🎀", color: "badge-red", tip: "Ideal para recomposición corporal con entrenamiento y déficit controlado." };
  return { text: "Obesidad 🚨", color: "badge-red", tip: "Enfoque clínico en déficit y cardio de bajo impacto." };
};

window.getCaloricCyclingTarget = function(dayName) {
  const baseKcal = window.appState.profile.targetCaloriesBase || 1706;
  const isAlto = ["Martes", "Jueves", "Sábado"].includes(dayName);
  
  // Días Altos (Martes/Jueves/Sábado) = Base + 250 kcal (1956 kcal)
  // Días Bajos (Otros días) = Base - 200 kcal (1506 kcal)
  const kcal = isAlto ? baseKcal + 250 : baseKcal - 200;
  
  // PDF clinical percentages: 24% Protein, 46% Carbs, 30% Fat
  const p = Math.round((kcal * 0.24) / 4);
  const c = Math.round((kcal * 0.46) / 4);
  const f = Math.round((kcal * 0.30) / 9);
  
  return {
    type: isAlto ? "Día Alto 🍕" : "Día Bajo 🎀",
    kcal,
    p,
    c,
    f
  };
};

window.smaeFactors = {
  cereales: { kcal: 70, p: 2, c: 15, g: 0 },
  verduras: { kcal: 25, p: 2, c: 4, g: 0 },
  frutas: { kcal: 60, p: 0, c: 15, g: 0 },
  animal: { kcal: 55, p: 7, c: 0, g: 3 },
  leguminosas: { kcal: 120, p: 8, c: 20, g: 1 },
  leche: { kcal: 95, p: 9, c: 12, g: 2 },
  grasas: { kcal: 45, p: 0, c: 0, g: 5 },
  cerealesGrasa: { kcal: 115, p: 2, c: 15, g: 5 },
  grasasProteina: { kcal: 70, p: 3, c: 3, g: 5 }
};

