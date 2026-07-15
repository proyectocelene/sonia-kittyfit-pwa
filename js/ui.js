/* ==========================================================================
   SONIA KITTYFIT - USER INTERFACE DRAWERS & EVENTS (ui.js)
   ========================================================================== */

window.showCuteAlert = function(title, message, icon = "🎀") {
  document.getElementById("cute-alert-title").textContent = title;
  document.getElementById("cute-alert-message").textContent = message;
  document.getElementById("cute-alert-icon").textContent = icon;
  document.getElementById("cute-alert-cancel-btn").style.display = "none";
  document.getElementById("cute-alert-modal").classList.add("open");
};

window.showCuteConfirm = function(title, message, callback, icon = "❓") {
  document.getElementById("cute-alert-title").textContent = title;
  document.getElementById("cute-alert-message").textContent = message;
  document.getElementById("cute-alert-icon").textContent = icon;
  document.getElementById("cute-alert-cancel-btn").style.display = "block";
  document.getElementById("cute-alert-modal").classList.add("open");
  window.confirmCallback = callback;
};

// Bind alert buttons globally
document.getElementById("cute-alert-confirm-btn").addEventListener("click", () => {
  document.getElementById("cute-alert-modal").classList.remove("open");
  if (window.confirmCallback) {
    window.confirmCallback();
    window.confirmCallback = null;
  }
});

document.getElementById("cute-alert-cancel-btn").addEventListener("click", () => {
  document.getElementById("cute-alert-modal").classList.remove("open");
  window.confirmCallback = null;
});

document.getElementById("close-cute-alert-btn").addEventListener("click", () => {
  document.getElementById("cute-alert-modal").classList.remove("open");
  window.confirmCallback = null;
});

function randomizePassiveQuote() {
  const quoteEl = document.getElementById("kitty-passive-quote");
  if (quoteEl) {
    const rnd = Math.floor(Math.random() * window.passiveQuotes.length);
    quoteEl.textContent = window.passiveQuotes[rnd];
  }
}

window.updateCompliance = function(dateStr) {
  const log = window.appState.history.find(h => h.date === dateStr);
  if (!log) return;
  
  let score = 0;
  if (log.water >= 2.2) score += 1;
  if (log.mealsCompleted && log.mealsCompleted.length >= 4) score += 1;
  if (log.workoutDone && log.workoutDone !== "none") score += 1;
  
  log.compliance = score;
};

window.getCompletedMealsPortions = function(todayLog) {
  const eatenFromMeals = { cereales: 0, verduras: 0, frutas: 0, animal: 0, leguminosas: 0, leche: 0, grasas: 0, cerealesGrasa: 0, grasasProteina: 0 };
  const isAlto = ["Martes", "Jueves", "Sábado"].includes(window.currentDay);
  
  const mealsKeys = ["Desayuno", "ColaciónMatutina", "Comida", "ColaciónVespertina", "Cena"];
  const displayNames = ["Desayuno", "Colación Matutina", "Comida", "Colación Vespertina", "Cena"];
  
  todayLog.mealsCompleted.forEach(mealName => {
    const idx = displayNames.indexOf(mealName);
    if (idx !== -1) {
      const mKey = mealsKeys[idx];
      const mealP = window.appState.mealPortions[mKey] || {};
      Object.keys(mealP).forEach(pKey => {
        let val = mealP[pKey] || 0;
        if (isAlto && mKey === "Comida" && pKey === "cereales") val += 1;
        if (isAlto && mKey === "Comida" && pKey === "animal") val += 1;
        eatenFromMeals[pKey] += val;
      });
    }
  });
  return eatenFromMeals;
};

window.renderDashboard = function() {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  document.getElementById("dash-weight").textContent = todayLog.weight.toFixed(1);
  document.getElementById("dash-fat-pct").textContent = todayLog.fat.toFixed(1);
  
  const muscleM = todayLog.weight * (1 - (todayLog.fat / 100));
  document.getElementById("dash-muscle-mass").textContent = `Masa Magra: ${muscleM.toFixed(1)} kg`;
  
  const bmi = window.calculateBMI(todayLog.weight, window.appState.profile.height);
  document.getElementById("imc-value").textContent = bmi;
  
  const bmiInfo = window.getBMICategory(parseFloat(bmi));
  const badge = document.getElementById("imc-badge");
  badge.textContent = bmiInfo.text;
  badge.className = `badge ${bmiInfo.color}`;
  
  const weightDeviation = todayLog.weight - 68.1;
  const rotAngle = Math.min(Math.max(weightDeviation * 1.5, -25), 25);
  const beamEl = document.getElementById("scale-beam-rot");
  if (beamEl) {
    beamEl.style.transform = `rotate(${rotAngle}deg)`;
  }
  
  let customAdvice = "";
  if (parseFloat(bmi) >= 25) {
    customAdvice = `Con ${window.appState.profile.height} cm y ${todayLog.weight.toFixed(1)} kg, tu IMC es ${bmi}. Estás en la delgada línea roja del sobrepeso, Sonia. ¡Mueve ese cuerpecito! 🐽🎀`;
  } else {
    customAdvice = `Con ${window.appState.profile.height} cm y ${todayLog.weight.toFixed(1)} kg, tu IMC es ${bmi}. Rango saludable. Aún así te vigilo, no te confíes. 💖`;
  }
  document.getElementById("imc-advice").textContent = customAdvice;
  
  const todayTarget = window.getCaloricCyclingTarget(window.currentDay);
  document.getElementById("cycling-badge").textContent = todayTarget.type;
  if (todayTarget.type.includes("Alto")) {
    document.getElementById("cycling-badge").style.backgroundColor = "var(--yellow-kitty)";
    document.getElementById("cycling-badge").style.color = "#7f5f00";
  } else {
    document.getElementById("cycling-badge").style.backgroundColor = "var(--pink-soft)";
    document.getElementById("cycling-badge").style.color = "var(--pink-deep)";
  }
  
  let caloriesEaten = 0;
  let pEaten = 0;
  let cEaten = 0;
  let fEaten = 0;
  
  const todayMeals = window.appState.dietPlan[window.currentDay] || [];
  todayLog.mealsCompleted.forEach(mealName => {
    const meal = todayMeals.find(m => m.name === mealName);
    if (meal) {
      caloriesEaten += meal.kcal;
      pEaten += meal.p;
      cEaten += meal.c;
      fEaten += meal.g;
    }
  });
  
  // Calculate extra SMAE raciones eaten outside completed meals
  const eatenFromMeals = window.getCompletedMealsPortions(todayLog);
  let extraKcal = 0;
  let extraP = 0;
  let extraC = 0;
  let extraG = 0;
  
  Object.keys(todayLog.smaeEaten).forEach(pKey => {
    const totalEaten = todayLog.smaeEaten[pKey] || 0;
    const mealEaten = eatenFromMeals[pKey] || 0;
    const extraVal = Math.max(0, totalEaten - mealEaten);
    if (extraVal > 0) {
      const factors = window.smaeFactors[pKey] || { kcal: 0, p: 0, c: 0, g: 0 };
      extraKcal += extraVal * factors.kcal;
      extraP += extraVal * factors.p;
      extraC += extraVal * factors.c;
      extraG += extraVal * factors.g;
    }
  });
  
  const totalCaloriesEaten = Math.round(caloriesEaten + extraKcal);
  const totalProteinEaten = Math.round(pEaten + extraP);
  const totalCarbsEaten = Math.round(cEaten + extraC);
  const totalFatEaten = Math.round(fEaten + extraG);
  
  todayLog.calories = totalCaloriesEaten;
  todayLog.protein = totalProteinEaten;
  todayLog.carbs = totalCarbsEaten;
  todayLog.fatEaten = totalFatEaten;
  
  document.getElementById("dash-cal-eaten").textContent = totalCaloriesEaten;
  document.getElementById("dash-p-eaten").textContent = totalProteinEaten;
  document.getElementById("dash-c-eaten").textContent = totalCarbsEaten;
  document.getElementById("dash-f-eaten").textContent = totalFatEaten;
  
  document.getElementById("dash-cal-target").textContent = todayTarget.kcal;
  document.getElementById("dash-p-target").textContent = todayTarget.p;
  document.getElementById("dash-c-target").textContent = todayTarget.c;
  document.getElementById("dash-f-target").textContent = todayTarget.f;
  
  document.getElementById("cycle-today-type").textContent = `${todayTarget.type} (${todayTarget.kcal} kcal)`;
  
  const balanceEl = document.getElementById("dash-cal-balance");
  if (balanceEl) {
    const diff = todayTarget.kcal - totalCaloriesEaten;
    if (diff > 0) {
      balanceEl.textContent = `Te faltan ${diff} kcal para tu meta diaria 🍓`;
      balanceEl.style.color = "var(--pink-deep)";
    } else if (diff === 0) {
      balanceEl.textContent = `¡Meta calórica exacta alcanzada! 🏆✨`;
      balanceEl.style.color = "var(--green-bright)";
    } else {
      balanceEl.textContent = `Te excediste por ${Math.abs(diff)} kcal hoy ⚖️`;
      balanceEl.style.color = "var(--pink-dark)";
    }
  }
  
  const circle = document.getElementById("cal-progress");
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  
  const pct = Math.min(totalCaloriesEaten / todayTarget.kcal, 1);
  const offset = circumference - pct * circumference;
  circle.style.strokeDashoffset = offset;
  
  const pPct = Math.min((totalProteinEaten / todayTarget.p) * 100, 100);
  const cPct = Math.min((totalCarbsEaten / todayTarget.c) * 100, 100);
  const fPct = Math.min((totalFatEaten / todayTarget.f) * 100, 100);
  
  document.getElementById("bar-protein").style.width = `${pPct}%`;
  document.getElementById("bar-carb").style.width = `${cPct}%`;
  document.getElementById("bar-fat").style.width = `${fPct}%`;
  
  const waterL = todayLog.water;
  document.getElementById("water-progress-text").textContent = `${waterL.toFixed(2)}L / ${window.appState.profile.waterTarget}L`;
  const waterPct = Math.min((waterL / window.appState.profile.waterTarget) * 100, 100);
  document.getElementById("water-fill-height").style.height = `${waterPct}%`;
  
  const weekdayToWorkout = {
    Lunes: { name: "Día A", focus: "Cadena Anterior" },
    Martes: { name: "Cardio", focus: "Resistencia Cardiovascular" },
    Miércoles: { name: "Día B", focus: "Cadena Posterior" },
    Jueves: { name: "Descanso Activo", focus: "Pausas Activas / Estiramientos" },
    Viernes: { name: "Día C", focus: "Activación Mixta y Core" },
    Sábado: { name: "Cardio", focus: "Resistencia Cardiovascular" },
    Domingo: { name: "Descanso", focus: "Recuperación y Meditación" }
  };
  
  const todayWorkout = weekdayToWorkout[window.currentDay] || { name: "Día A", focus: "Cadena Anterior" };
  
  if (todayLog.workoutDone !== "none") {
    document.getElementById("today-routine-name").textContent = `Rutina: ${todayLog.workoutDone}`;
    const focusMap = { A: "Cadena Anterior", B: "Cadena Posterior", C: "Core y Activación", Cardio: "Cardio", Personalizada: "Personalizada 🐾" };
    document.getElementById("today-workout-focus").textContent = focusMap[todayLog.workoutDone] || "Completado";
  } else {
    document.getElementById("today-routine-name").textContent = todayWorkout.name;
    document.getElementById("today-workout-focus").textContent = todayWorkout.focus;
  }
};

window.renderStats = function() {
  const container = document.getElementById("heatmap-grid-container");
  container.innerHTML = "";
  
  const today = new Date();
  const daysList = [];
  
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    daysList.push({ dateStr, label: `${day}/${month}` });
  }
  
  daysList.forEach(item => {
    const log = window.appState.history.find(h => h.date === item.dateStr) || { compliance: 0, water: 0, workoutDone: "none", calories: 0 };
    const level = log.compliance !== undefined ? log.compliance : 0;
    
    const cell = document.createElement("div");
    cell.className = `heatmap-day level-${level}`;
    // Removed number text for a cleaner premium tile appearance
    cell.textContent = "";
    
    let workoutText = log.workoutDone !== "none" ? `Entreno: ${log.workoutDone}` : "Sin entreno";
    let dietText = `${log.calories} kcal`;
    let waterText = `${log.water.toFixed(1)}L agua`;
    
    cell.setAttribute("data-tooltip", `${item.label} | ${workoutText} | ${dietText} | ${waterText}`);
    container.appendChild(cell);
  });
  
  const tableBody = document.getElementById("history-table-body");
  tableBody.innerHTML = "";
  
  const reversedLogs = [...window.appState.history].reverse();
  reversedLogs.forEach(log => {
    const row = document.createElement("tr");
    const formattedDate = log.date.split("-").reverse().join("/");
    let workoutLabel = log.workoutDone;
    if (workoutLabel === "none") workoutLabel = "Descanso 🧸";
    
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td style="font-weight:700;">${log.weight.toFixed(1)}</td>
      <td>${(log.fat !== undefined ? log.fat : 31.8).toFixed(1)}%</td>
      <td>${log.hr} lpm</td>
      <td><span class="badge badge-purple">${workoutLabel}</span></td>
      <td>
        <button class="btn-delete-row" onclick="window.deleteHistoryRow('${log.date}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  window.drawCharts();
};

window.drawCharts = function() {
  const sortedLogs = [...window.appState.history].sort((a,b) => a.date.localeCompare(b.date));
  const dates = sortedLogs.map(l => l.date.split("-").reverse().slice(0,2).join("/"));
  const weights = sortedLogs.map(l => l.weight);
  const hrs = sortedLogs.map(l => l.hr);
  
  const startWeight = window.appState.profile.initialWeight;
  const currentWeight = weights[weights.length - 1] || startWeight;
  const diffPct = ((startWeight - currentWeight) / startWeight * 100).toFixed(1);
  document.getElementById("weight-loss-percentage").textContent = `-${diffPct}% peso`;

  if (window.weightChartInstance) window.weightChartInstance.destroy();
  if (window.hrChartInstance) window.hrChartInstance.destroy();

  const isDark = document.body.classList.contains("dark-mode");
  const fontColor = isDark ? "#ffe5ec" : "#5c3d42";
  const gridColor = isDark ? "rgba(255,204,213,0.15)" : "rgba(255,204,213,0.3)";

  const ctxWeight = document.getElementById("weightChart").getContext("2d");
  window.weightChartInstance = new Chart(ctxWeight, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Peso (kg)',
        data: weights,
        borderColor: '#ff4d6d',
        backgroundColor: 'rgba(255, 77, 109, 0.1)',
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#ff85a1',
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: gridColor },
          ticks: { color: fontColor, font: { family: 'Quicksand', weight: 'bold' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: fontColor, font: { family: 'Quicksand', weight: 'bold' } }
        }
      }
    }
  });

  const ctxHr = document.getElementById("hrChart").getContext("2d");
  window.hrChartInstance = new Chart(ctxHr, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'FC (lpm)',
        data: hrs,
        backgroundColor: hrs.map(hr => (hr >= 115 && hr <= 135) ? 'rgba(112, 161, 255, 0.8)' : 'rgba(255, 117, 143, 0.8)'),
        borderColor: '#ff758f',
        borderWidth: 1.5,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: gridColor },
          ticks: { color: fontColor, font: { family: 'Quicksand', weight: 'bold' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: fontColor, font: { family: 'Quicksand', weight: 'bold' } }
        }
      }
    }
  });
};

window.loadThemePreference = function() {
  const savedTheme = localStorage.getItem("sonia_kittyfit_theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
};

window.switchTab = function(tabId) {
  window.activeTab = tabId;
  
  document.querySelectorAll(".tab-content").forEach(el => {
    el.classList.remove("active");
  });
  
  const activeEl = document.getElementById(`tab-${tabId}`);
  if (activeEl) activeEl.classList.add("active");
  
  document.querySelectorAll(".nav-item").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  randomizePassiveQuote();
  
  if (tabId === "dashboard") {
    window.renderDashboard();
  } else if (tabId === "diet") {
    window.renderDiet();
  } else if (tabId === "exercise") {
    window.loadAllMachineImages().then(() => {
      window.renderExercise();
    });
  } else if (tabId === "chat") {
    window.renderChat();
  } else if (tabId === "stats") {
    window.renderStats();
  } else if (tabId === "profile") {
    document.getElementById("prof-age").value = window.appState.profile.age;
    document.getElementById("prof-height").value = window.appState.profile.height;
    document.getElementById("prof-weight").value = window.appState.profile.initialWeight.toFixed(1);
    document.getElementById("prof-weight-target").value = window.appState.profile.targetWeight.toFixed(1);
    document.getElementById("prof-calories").value = window.appState.profile.targetCaloriesBase;
    document.getElementById("prof-p-ratio").value = window.appState.profile.targetProteinBase;
    document.getElementById("prof-c-ratio").value = window.appState.profile.targetCarbsBase;
    document.getElementById("prof-f-ratio").value = window.appState.profile.targetFatBase;
    document.getElementById("prof-weight-unit").value = window.appState.profile.weightUnit || "kg";
    document.getElementById("prof-api-key").value = window.appState.profile.deepseekApiKey;
    
    window.loadDietEditorDay();
  }
};

// Bind navigation clicks
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    const tab = item.getAttribute("data-tab");
    window.switchTab(tab);
  });
});

// Bind scrolls
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("day-tab")) {
    window.currentDay = e.target.getAttribute("data-day");
    window.renderDiet();
  }
  
  const tabBtn = e.target.closest(".routine-tab");
  if (tabBtn) {
    window.activeRoutineTab = tabBtn.getAttribute("data-routine");
    window.renderExercise();
  }
});

window.changeActiveRoutineSelection = function() {
  const choice = document.getElementById("flex-routine-choice").value;
  window.activeRoutineTab = choice;
  window.renderExercise();
};

document.getElementById("add-water-btn").addEventListener("click", () => {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  todayLog.water += 0.26;
  window.saveState();
  window.updateCompliance(todayStr);
  window.renderDashboard();
  window.saveState();
  
  const glass = document.getElementById("water-fill-glass");
  glass.style.transform = "scale(1.15)";
  setTimeout(() => { glass.style.transform = "scale(1)"; }, 200);
});

document.getElementById("go-workout-btn").addEventListener("click", () => {
  const weekdayToRoutine = {
    Lunes: "A", Martes: "Cardio", Miércoles: "B", Jueves: "Cardio", Viernes: "C", Sábado: "Cardio", Domingo: "Cardio"
  };
  window.activeRoutineTab = weekdayToRoutine[window.currentDay] || "A";
  window.switchTab("exercise");
});

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("sonia_kittyfit_theme", isDark ? "dark" : "light");
  if (window.activeTab === "stats") {
    window.drawCharts();
  }
});

// Biometrics modals
const logModal = document.getElementById("log-modal");
document.getElementById("open-log-modal-btn").addEventListener("click", () => {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  document.getElementById("log-date").value = todayStr;
  document.getElementById("log-weight").value = todayLog.weight.toFixed(1);
  document.getElementById("log-fat-pct").value = (todayLog.fat !== undefined ? todayLog.fat : 31.8).toFixed(1);
  document.getElementById("log-hr").value = todayLog.hr;
  document.getElementById("log-workout-done").value = todayLog.workoutDone;
  document.getElementById("log-feeling").value = todayLog.feeling || "";
  document.getElementById("log-notes").value = todayLog.notes || "";
  
  logModal.classList.add("open");
});

document.getElementById("close-modal-btn").addEventListener("click", () => { logModal.classList.remove("open"); });
logModal.addEventListener("click", (e) => { if (e.target === logModal) logModal.classList.remove("open"); });

// biometrics logger form submission
document.getElementById("biometrics-log-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const dateStr = document.getElementById("log-date").value;
  const weight = parseFloat(document.getElementById("log-weight").value);
  const fatPct = parseFloat(document.getElementById("log-fat-pct").value);
  const hr = parseInt(document.getElementById("log-hr").value);
  const workoutDone = document.getElementById("log-workout-done").value;
  const feeling = document.getElementById("log-feeling").value;
  const notes = document.getElementById("log-notes").value;
  
  // Bounds validation
  if (weight < 30 || weight > 250) {
    window.showCuteAlert("Peso Incoherente", "Ingresa un peso entre 30 y 250 kg, reina.", "😿");
    return;
  }
  if (fatPct < 3 || fatPct > 60) {
    window.showCuteAlert("Grasa Incoherente", "Ingresa un porcentaje de grasa entre 3% y 60%, médica.", "😿");
    return;
  }
  if (hr < 40 || hr > 220) {
    window.showCuteAlert("FC Incoherente", "Tu pulso cardíaco debe estar entre 40 y 220 lpm.", "😿");
    return;
  }
  
  let log = window.appState.history.find(h => h.date === dateStr);
  if (!log) {
    log = {
      date: dateStr,
      weight: weight,
      fat: fatPct,
      hr: hr,
      workoutDone: workoutDone,
      calories: 0,
      water: 0,
      compliance: 0,
      feeling: feeling,
      notes: notes,
      smaeOffsets: {},
      mealsCompleted: [],
      workoutLogged: {}
    };
    window.appState.history.push(log);
  } else {
    log.weight = weight;
    log.fat = fatPct;
    log.hr = hr;
    log.workoutDone = workoutDone;
    log.feeling = feeling;
    log.notes = notes;
  }
  
  window.appState.history.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  window.saveState();
  window.updateCompliance(dateStr);
  window.renderDashboard();
  window.renderStats();
  window.saveState();
  
  logModal.classList.remove("open");
  window.showCuteAlert("¡Bitácora Guardada! 📝🎀", `Pesas ${weight.toFixed(1)} kg | Grasa: ${fatPct.toFixed(1)}% | FC: ${hr} lpm.`, "🌸");
});

window.handleExSelectChange = function(selectId, inputId) {
  const sel = document.getElementById(selectId);
  const input = document.getElementById(inputId);
  if (sel.value === "otro") {
    input.classList.remove("hidden");
    input.value = "";
    input.focus();
  } else {
    input.classList.add("hidden");
    input.value = sel.value;
  }
};

window.populateExerciseSelects = function() {
  const selects = ["add-ex-select", "qa-ex-select"];
  
  let optionsHTML = '<option value="" disabled selected>-- Selecciona un ejercicio --</option>';
  for (const [cat, exercises] of Object.entries(window.exerciseDatabase)) {
    optionsHTML += `<optgroup label="${cat}">`;
    exercises.forEach(ex => {
      optionsHTML += `<option value="${ex}">${ex}</option>`;
    });
    optionsHTML += `</optgroup>`;
  }
  optionsHTML += `<option value="otro">Otro / Personalizado...</option>`;
  
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = optionsHTML;
  });
};

// Initial DOM bindings and setup
document.addEventListener("DOMContentLoaded", () => {
  window.populateExerciseSelects();
});

// Profile Settings
document.getElementById("profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const newInitWeight = parseFloat(document.getElementById("prof-weight").value);
  const targetCals = parseInt(document.getElementById("prof-calories").value);
  
  if (newInitWeight < 30 || newInitWeight > 250) {
    window.showCuteAlert("Peso Inválido", "Ingresa un peso inicial válido.", "😿");
    return;
  }
  if (targetCals < 1000 || targetCals > 5000) {
    window.showCuteAlert("Calorías Inválidas", "Tus calorías base deben estar entre 1000 y 5000 kcal.", "😿");
    return;
  }
  
  window.appState.profile.age = parseInt(document.getElementById("prof-age").value);
  window.appState.profile.height = parseInt(document.getElementById("prof-height").value);
  
  const oldInitWeight = window.appState.profile.initialWeight;
  window.appState.profile.initialWeight = newInitWeight;
  window.appState.profile.targetWeight = parseFloat(document.getElementById("prof-weight-target").value);
  
  window.appState.profile.targetCaloriesBase = targetCals;
  window.appState.profile.targetProteinBase = parseInt(document.getElementById("prof-p-ratio").value);
  window.appState.profile.targetCarbsBase = parseInt(document.getElementById("prof-c-ratio").value);
  window.appState.profile.targetFatBase = parseInt(document.getElementById("prof-f-ratio").value);
  window.appState.profile.weightUnit = document.getElementById("prof-weight-unit").value;
  
  window.appState.profile.deepseekApiKey = document.getElementById("prof-api-key").value.trim();
  
  if (oldInitWeight !== newInitWeight) {
    const diff = newInitWeight - oldInitWeight;
    window.appState.history.forEach(log => {
      log.weight += diff;
    });
  }

  window.saveState();
  window.showCuteAlert("¡Ajustes Guardados! 🌸", "Tus datos y targets se actualizaron correctamente, Sonia.", "💖");
  window.renderDashboard();
  window.saveState();
});



// Backup Data Actions
document.getElementById("export-data-btn").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.appState));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `sonia_kittyfit_backup_${window.getTodayDateString()}.json`);
  dlAnchorElem.click();
  window.showCuteAlert("¡Copia Listísima! 💾🎀", "Tu archivo de copia de seguridad JSON se ha descargado.", "✨");
});

document.getElementById("import-data-btn").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (imported && imported.profile && imported.history) {
        window.showCuteConfirm("¿Importar Respaldo? 🐾", "Esto reemplazará todos tus entrenamientos, historial de peso y configuraciones actuales de Sonia. ¿Estás segura?", () => {
          window.appState = imported;
          window.saveState();
          window.location.reload();
        }, "⚠️");
      } else {
        window.showCuteAlert("Archivo Inválido 😿", "El archivo JSON no corresponde a una copia de seguridad válida de Sonia KittyFit.", "❌");
      }
    } catch (err) {
      window.showCuteAlert("Error de Lectura 😿", "No se pudo leer el archivo JSON seleccionado.", "❌");
    }
  };
  reader.readAsText(file);
});

document.getElementById("reset-app-btn").addEventListener("click", () => {
  window.showCuteConfirm("¿Restablecer de Fábrica? 🚨", "Se borrará permanentemente todo tu historial de peso, entrenamientos y comidas registradas, volviendo al plan original del PDF de Sonia. ¿Proceder?", () => {
    localStorage.removeItem("sonia_kittyfit_state");
    window.location.reload();
  }, "🔥");
});

document.getElementById("close-toast-btn").addEventListener("click", () => {
  document.getElementById("alert-overload").classList.add("hidden");
});

window.deleteHistoryRow = function(dateStr) {
  window.showCuteConfirm("¿Segura, gordis? 😿", `¿De verdad quieres borrar el registro del ${dateStr}? No llores si pierdes el avance.`, () => {
    const todayStr = window.getTodayDateString();
    if (dateStr === todayStr) {
      const todayLog = window.appState.history.find(h => h.date === todayStr);
      todayLog.weight = window.appState.profile.initialWeight;
      todayLog.fat = window.appState.profile.initialFatPercentage;
      todayLog.hr = 72;
      todayLog.workoutDone = "none";
      todayLog.water = 0;
      todayLog.mealsCompleted = [];
      todayLog.smaeEaten = { cereales: 0, verduras: 0, frutas: 0, animal: 0, leguminosas: 0, leche: 0, grasas: 0, cerealesGrasa: 0, grasasProteina: 0 };
      todayLog.workoutLogged = {};
      todayLog.feeling = "";
      todayLog.notes = "";
      todayLog.smaeOffsets = {};
    } else {
      window.appState.history = window.appState.history.filter(h => h.date !== dateStr);
    }
    
    window.saveState();
    window.renderStats();
    window.renderDashboard();
    window.saveState();
  }, "🗑️");
};

// Alacena Store Toggles
document.getElementById("pantry-store-checkbox").addEventListener("change", (e) => {
  window.appState.profile.canGoToStore = e.target.checked;
  window.saveState();
});

document.getElementById("pantry-budget").addEventListener("change", (e) => {
  window.appState.profile.foodBudget = e.target.value;
  window.saveState();
});

document.getElementById("pantry-add-btn").addEventListener("click", () => {
  const input = document.getElementById("pantry-add-input");
  const value = input.value.trim().toLowerCase();
  
  if (value) {
    if (!window.appState.profile.pantry.includes(value)) {
      window.appState.profile.pantry.push(value);
      window.saveState();
      window.renderDiet();
      input.value = "";
      window.saveState();
    } else {
      window.showCuteAlert("¡Duplicado!", `Ya tienes '${value}' en tu alacena, gordis.`, "🐱");
    }
  }
});

// --- Dynamic Editors (Ajustes Tab) ---
window.loadDietEditorDay = function() {
  const day = document.getElementById("edit-diet-day").value;
  const container = document.getElementById("diet-editor-box");
  container.innerHTML = "";
  
  const meals = window.appState.dietPlan[day] || [];
  meals.forEach((meal, index) => {
    const card = document.createElement("div");
    card.className = "editor-meal-card";
    card.innerHTML = `
      <div class="editor-meal-header">
        <input type="text" id="edit-meal-name-${index}" value="${meal.name}" class="form-input-edit-title" placeholder="Nombre de la comida">
      </div>
      <div class="editor-meal-body">
        <label class="editor-label">Ingredientes y Equivalentes:</label>
        <textarea id="edit-meal-desc-${index}" class="form-input-edit-textarea" rows="3" placeholder="Describe los ingredientes de la receta...">${meal.description}</textarea>
        
        <div class="form-grid-3" style="margin-top: 10px;">
          <div class="form-group-edit">
            <label style="font-size: 0.65rem; font-weight: 700; color: var(--text-secondary);">Calorías ⚡</label>
            <input type="number" id="edit-meal-kcal-${index}" value="${meal.kcal}" class="form-input-edit-number">
          </div>
          <div class="form-group-edit">
            <label style="font-size: 0.65rem; font-weight: 700; color: var(--text-secondary);">Proteínas 🍗</label>
            <input type="number" id="edit-meal-p-${index}" value="${meal.p}" class="form-input-edit-number">
          </div>
          <div class="form-group-edit">
            <label style="font-size: 0.65rem; font-weight: 700; color: var(--text-secondary);">Carbs 🌾</label>
            <input type="number" id="edit-meal-c-${index}" value="${meal.c}" class="form-input-edit-number">
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
};

document.getElementById("save-diet-edits-btn").addEventListener("click", () => {
  const day = document.getElementById("edit-diet-day").value;
  const meals = window.appState.dietPlan[day] || [];
  
  meals.forEach((meal, index) => {
    meal.name = document.getElementById(`edit-meal-name-${index}`).value.trim();
    meal.description = document.getElementById(`edit-meal-desc-${index}`).value.trim();
    meal.kcal = parseInt(document.getElementById(`edit-meal-kcal-${index}`).value) || 0;
    meal.p = parseInt(document.getElementById(`edit-meal-p-${index}`).value) || 0;
    meal.c = parseInt(document.getElementById(`edit-meal-c-${index}`).value) || 0;
  });
  
  window.saveState();
  window.showCuteAlert("¡Guardado!", `Se actualizaron las recetas del día ${day}.`, "🍏");
  if (window.activeTab === "diet") {
    window.renderDiet();
  }
});

// --- Dynamic Chatbot Agent ---
window.renderChat = function() {
  const container = document.getElementById("chat-messages-container");
  const apiKeyWarning = document.getElementById("chat-no-key-warning");
  
  if (window.appState.profile.deepseekApiKey) {
    apiKeyWarning.classList.add("hidden");
  } else {
    apiKeyWarning.classList.remove("hidden");
  }
  
  container.innerHTML = "";
  
  if (window.appState.chatHistory.length === 0) {
    container.innerHTML = `
      <div class="chat-bubble assistant">
        <div class="bubble-text">¡Hola, Sonia! 🎀 A ver, dime qué dudas tienes hoy o qué quieres comer con lo que tienes tirado en tu alacena. No tengo todo el día, muévete.</div>
        <span class="bubble-time">10:00</span>
      </div>
    `;
    return;
  }
  
  window.appState.chatHistory.forEach(msg => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`;
    bubble.innerHTML = `
      <div class="bubble-text">${msg.content}</div>
      <span class="bubble-time">${msg.time || ''}</span>
    `;
    container.appendChild(bubble);
  });
  
  container.scrollTop = container.scrollHeight;
};

document.getElementById("chat-input-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const inputEl = document.getElementById("chat-text-input");
  const message = inputEl.value.trim();
  if (!message) return;
  
  const apiKey = window.appState.profile.deepseekApiKey;
  if (!apiKey) {
    window.showCuteAlert("¡API Key Faltante! 🚨", "A ver, reina, sin tu API Key de DeepSeek yo no puedo leer tu mente. Pégala directamente arriba para que podamos chatear.", "😿");
    return;
  }
  
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  window.appState.chatHistory.push({ role: "user", content: message, time: timeStr });
  if (window.appState.chatHistory.length > 20) {
    window.appState.chatHistory = window.appState.chatHistory.slice(-20);
  }
  window.renderChat();
  inputEl.value = "";
  
  const typingIndicator = document.getElementById("chat-typing");
  typingIndicator.classList.remove("hidden");
  
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  const todayTarget = window.getCaloricCyclingTarget(window.currentDay);
  
  const caloriesEaten = todayLog.calories;
  const pEaten = todayLog.protein;
  const cEaten = todayLog.carbs;
  const fEaten = todayLog.fatEaten;
  
  const caloriesRemaining = todayTarget.kcal - caloriesEaten;
  const pRemaining = todayTarget.p - pEaten;
  const cRemaining = todayTarget.c - cEaten;
  const fRemaining = todayTarget.f - fEaten;
  
  const pantryList = window.appState.profile.pantry.join(", ");
  const storeStatus = window.appState.profile.canGoToStore ? "Sí puede ir de compras" : "No tiene opción de ir al súper hoy";
  const budget = window.appState.profile.foodBudget;
  const workoutType = todayLog.workoutDone !== "none" ? `Hizo rutina ${todayLog.workoutDone}` : "No ha hecho entrenamiento todavía hoy";
  
  const systemPrompt = `
    Eres el asistente personal virtual de SONIA RAMIREZ CORRAL (médica de servicio social de 27 años, 176 cm de estatura, peso actual ${todayLog.weight.toFixed(1)} kg, IMC ${window.calculateBMI(todayLog.weight, window.appState.profile.height)}, porcentaje de grasa ${todayLog.fat.toFixed(1)}%).
    Tu personalidad debe ser "Girly Pop / Hello Kitty / Sanrio" pero muy divertida, sarcástica, pasivo-agresiva, llevada y cómica (usa modismos como "¡Tú puedes gordis!", "¿Cuántas toneladas pesaste hoy?", "muévete", "no seas floja", etc.). Debes motivarla y regañarla con cariño.
    
    DATOS CLÍNICOS DEL DÍA DE HOY:
    - Tipo de Día: ${todayTarget.type} (Objetivo: ${todayTarget.kcal} kcal, ${todayTarget.p}g Proteína, ${todayTarget.c}g Carbohidratos, ${todayTarget.f}g Grasa)
    - Consumido hoy: ${caloriesEaten} kcal (P: ${pEaten}g, C: ${cEaten}g, G: ${fEaten}g)
    - Restante por consumir: ${caloriesRemaining} kcal (P: ${pRemaining}g, C: ${cRemaining}g, G: ${fRemaining}g)
    - Alacena disponible: ${pantryList}
    - Condiciones de compra: ${storeStatus} | Presupuesto: ${budget}
    - Ejercicio hoy: ${workoutType} (Rutina meta: ${window.currentDay})

    INSTRUCCIONES CLAVE:
    1. Si te pregunta qué comer o cenar, diseña una receta rápida y exacta basada EXCLUSIVAMENTE en lo que tiene en su ALACENA, respetando sus calorías y macronutrientes restantes. Si no tiene suficientes cosas, dile qué comprar de forma barata (teniendo en cuenta su presupuesto ${budget} y si puede ir al súper).
    2. Si te pregunta sobre su rutina, recomiéndale qué hacer y adviértele sobre la sobrecarga progresiva.
    3. Habla siempre en español, mantén las respuestas cortas, sarcásticas y cómicas.
  `;
  
  try {
    const apiHistory = window.appState.chatHistory.map(h => ({ role: h.role, content: h.content }));
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...apiHistory
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    typingIndicator.classList.add("hidden");
    
    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      const respTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      window.appState.chatHistory.push({ role: "assistant", content: reply, time: respTime });
      if (window.appState.chatHistory.length > 20) {
        window.appState.chatHistory = window.appState.chatHistory.slice(-20);
      }
      window.saveState();
      window.renderChat();
    } else {
      throw new Error();
    }
  } catch (error) {
    typingIndicator.classList.add("hidden");
    const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    window.appState.chatHistory.push({ 
      role: "assistant", 
      content: "😿 Ay, gordis, algo falló en tu conexión o tu API key de DeepSeek está mal escrita. Revisa tus datos en Ajustes o pégala de nuevo.", 
      time: errTime 
    });
    window.saveState();
    window.renderChat();
  }
});

// Save API Key directly from chat warning input box
document.getElementById("btn-save-chat-api-key").addEventListener("click", () => {
  const val = document.getElementById("chat-api-key-input").value.trim();
  if (val) {
    window.appState.profile.deepseekApiKey = val;
    window.saveState();
    window.renderChat();
    window.showCuteAlert("¡IA Activada! 💬💖", "Tu DeepSeek API Key se guardó con éxito. ¡Ya podemos platicar, gordis!", "✨");
  } else {
    window.showCuteAlert("Llave vacía", "Pega una llave de DeepSeek válida para activarme.", "😿");
  }
});

// Copy Report to clipboard
document.getElementById("btn-export-ai").addEventListener("click", () => {
  const sortedLogs = [...window.appState.history].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 7).reverse();
  
  let markdownText = `# Reporte Clínico y Bitácora de Sonia - ${window.getTodayDateString()}\n\n`;
  markdownText += `## Datos Fisiológicos Generales:\n`;
  markdownText += `- Paciente: Sonia Ramirez Corral (27 años)\n`;
  markdownText += `- Estatura: ${window.appState.profile.height} cm\n`;
  markdownText += `- Peso Inicial: ${window.appState.profile.initialWeight} kg | Meta Ideal Lorentz/IMC: ${window.appState.profile.targetWeight} kg\n`;
  markdownText += `- Porcentaje de Grasa Inicial: ${window.appState.profile.initialFatPercentage}%\n\n`;
  markdownText += `## Bitácora de Adherencia (Últimos 7 días):\n\n`;
  
  markdownText += `| Fecha | Peso (kg) | Grasa (%) | FC (lpm) | Ejercicio | Agua (L) | Calorías Eaten | Sensación / Notas |\n`;
  markdownText += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  
  sortedLogs.forEach(log => {
    let workoutLabel = log.workoutDone !== 'none' ? `Día ${log.workoutDone}` : "Ninguno";
    markdownText += `| ${log.date} | ${log.weight.toFixed(1)} | ${(log.fat || 31.8).toFixed(1)} | ${log.hr} | ${workoutLabel} | ${log.water.toFixed(1)}L | ${log.calories} | ${log.feeling || '-'} / ${log.notes || '-'} |\n`;
  });
  
  markdownText += `\n## Cargas Actuales de Fuerza (Sobrecarga Progresiva):\n`;
  Object.keys(window.appState.currentWeights).forEach(exId => {
    let exName = "";
    let routine = "";
    
    ["A", "B", "C", "Personalizada"].forEach(rKey => {
      if (window.appState.workoutPlan[rKey] && window.appState.workoutPlan[rKey].exercises) {
        const ex = window.appState.workoutPlan[rKey].exercises.find(e => e.id === exId);
        if (ex) {
          exName = ex.name;
          routine = `Día ${rKey}`;
        }
      }
    });
    
    if (exName) {
      markdownText += `- [${routine}] ${exName}: **${window.appState.currentWeights[exId]} ${window.appState.currentUnits[exId]}**\n`;
    }
  });

  markdownText += `\n## Alacena Actual:\n`;
  markdownText += `- Ingredientes: ${window.appState.profile.pantry.join(", ")}\n`;
  markdownText += `- Puede ir a comprar: ${window.appState.profile.canGoToStore ? 'Sí' : 'No'}\n`;
  markdownText += `- Presupuesto: ${window.appState.profile.foodBudget}\n\n`;
  markdownText += `*Instrucciones para la IA: Analiza los datos de Sonia, evalúa si su déficit calórico semanal es estable, y sugieréle si debe realizar modificaciones a sus rutinas o plan de alimentación.*`;
  
  navigator.clipboard.writeText(markdownText).then(() => {
    window.showCuteAlert("¡Copiado, gordis! 📋💖", "El reporte en Markdown se copió a tu portapapeles. Pégalo en ChatGPT o Gemini para que lo analice.", "✨");
  }).catch(() => {
    window.showCuteAlert("Error", "No se pudo copiar automáticamente. Inténtalo de nuevo.", "😿");
  });
});

document.getElementById("btn-export-full-markdown").addEventListener("click", () => {
  const sortedLogs = [...window.appState.history].sort((a,b) => a.date.localeCompare(b.date));
  
  let markdownText = `# Reporte Clínico y Historial Completo - Paciente Sonia Ramirez\n\n`;
  markdownText += `## Datos Fisiológicos Generales:\n`;
  markdownText += `- Estatura: ${window.appState.profile.height} cm\n`;
  markdownText += `- Peso Inicial: ${window.appState.profile.initialWeight} kg | Meta Ideal: ${window.appState.profile.targetWeight} kg\n`;
  markdownText += `- Porcentaje de Grasa Inicial: ${window.appState.profile.initialFatPercentage}%\n\n`;
  
  markdownText += `## Historial Completo de Entrenamientos y Nutrición:\n\n`;
  markdownText += `| Fecha | Peso (kg) | Grasa (%) | FC (lpm) | Ejercicio | Agua (L) | Calorías | Feeling / Notas |\n`;
  markdownText += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  
  sortedLogs.forEach(log => {
    let workoutLabel = log.workoutDone !== 'none' ? `Día ${log.workoutDone}` : "Ninguno";
    markdownText += `| ${log.date} | ${log.weight.toFixed(1)} | ${(log.fat || 31.8).toFixed(1)} | ${log.hr} | ${workoutLabel} | ${log.water.toFixed(1)}L | ${log.calories} | ${log.feeling || '-'} / ${log.notes || '-'} |\n`;
  });
  
  navigator.clipboard.writeText(markdownText).then(() => {
    window.showCuteAlert("¡Historial Copiado! 📋💖", "Copiamos tu historial en formato Markdown a tu portapapeles.", "✨");
  });
});

document.getElementById("btn-copy-prescription-base").addEventListener("click", () => {
  const jsonTemplate = JSON.stringify(window.appState.workoutPlan, null, 2);
  navigator.clipboard.writeText(jsonTemplate).then(() => {
    window.showCuteAlert("¡Copiado! 📋🐾", "Copiamos el formato base JSON a tu portapapeles. Modifica los ejercicios y pégalo de vuelta.", "✨");
  });
});

document.getElementById("btn-apply-prescription-json").addEventListener("click", () => {
  const textarea = document.getElementById("prescription-json-textarea");
  const jsonText = textarea.value.trim();
  
  if (!jsonText) {
    window.showCuteAlert("Código Faltante", "Pega tu nuevo código de prescripción JSON en el recuadro primero.", "😿");
    return;
  }
  
  try {
    const newWorkoutPlan = JSON.parse(jsonText);
    if (newWorkoutPlan.A && newWorkoutPlan.B && newWorkoutPlan.C) {
      window.appState.workoutPlan = newWorkoutPlan;
      window.saveState();
      textarea.value = "";
      window.showCuteAlert("¡Prescripción Aplicada! 🏋️‍♀️✨", "Actualizamos tu lista de ejercicios base con éxito.", "😻");
      if (window.activeTab === "exercise") {
        window.renderExercise();
      }
    } else {
      window.showCuteAlert("JSON Inválido 🚨", "El JSON debe poseer las claves de rutinas A, B y C.", "😿");
    }
  } catch (err) {
    window.showCuteAlert("Error de Sintaxis", "El formato JSON ingresado tiene errores. Revísalo bien.", "😿");
  }
});

// Reset equivalents button listener
document.getElementById("reset-equiv-btn").addEventListener("click", () => {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  todayLog.smaeEaten = { cereales: 0, verduras: 0, frutas: 0, animal: 0, leguminosas: 0, leche: 0, grasas: 0, cerealesGrasa: 0, grasasProteina: 0 };
  todayLog.smaeOffsets = {};
  todayLog.mealsCompleted = [];
  
  window.saveState();
  window.updateCompliance(todayStr);
  window.renderDiet();
  window.renderDashboard();
  window.saveState();
  
  window.showCuteAlert("¡Reiniciado! 🔄", "Tus raciones y comidas registradas se han restablecido a cero. ¡Mantente en orden, Sonia!", "🧸");
});

// Screen Wake Lock API controls
async function requestWakeLockScreen() {
  if (!('wakeLock' in navigator)) return;
  try {
    window.wakeLockObj = await navigator.wakeLock.request('screen');
    document.getElementById("wake-lock-status-badge").textContent = "Activo ✓";
    document.getElementById("wake-lock-status-badge").className = "badge badge-yellow";
    console.log("Screen Wake Lock is active!");
    
    window.wakeLockObj.addEventListener('release', () => {
      document.getElementById("wake-lock-status-badge").textContent = "Inactivo";
      document.getElementById("wake-lock-status-badge").className = "badge badge-purple";
    });
  } catch (err) {
    console.error("Screen Wake Lock failed", err);
  }
}

async function releaseWakeLockScreen() {
  if (window.wakeLockObj !== null) {
    await window.wakeLockObj.release();
    window.wakeLockObj = null;
  }
}

document.getElementById("sensor-wake-lock").addEventListener("change", async (e) => {
  if (e.target.checked) {
    await requestWakeLockScreen();
  } else {
    await releaseWakeLockScreen();
  }
});

document.addEventListener('visibilitychange', async () => {
  if (window.wakeLockObj !== null && document.visibilityState === 'visible') {
    await requestWakeLockScreen();
  }
});

if (!('vibrate' in navigator)) {
  document.getElementById("vibrate-status-badge").textContent = "No soportado";
  document.getElementById("vibrate-status-badge").className = "badge badge-red";
}

window.toggleKitchenResources = function() {
  const content = document.getElementById("kitchen-resources-content");
  const chevron = document.getElementById("kitchen-chevron");
  if (content.classList.contains("hidden")) {
    content.classList.remove("hidden");
    chevron.style.transform = "rotate(180deg)";
  } else {
    content.classList.add("hidden");
    chevron.style.transform = "rotate(0deg)";
  }
};

window.addPantryItemDirect = function() {
  const input = document.getElementById("pantry-add-input");
  const value = input.value.trim().toLowerCase();
  if (value) {
    if (!window.appState.profile.pantry.includes(value)) {
      window.appState.profile.pantry.push(value);
      window.saveState();
      window.renderDiet();
      input.value = "";
      window.saveState();
    } else {
      window.showCuteAlert("¡Duplicado!", `Ya tienes '${value}' en tu alacena, gordis.`, "🐱");
    }
  }
};


