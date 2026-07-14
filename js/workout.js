/* ==========================================================================
   SONIA KITTYFIT - WORKOUT STRENGTH & PROGRESSIONS (workout.js)
   ========================================================================== */

window.triggerRestHapticVibration = function() {
  const vibrateToggle = document.getElementById("sensor-vibrate");
  if (vibrateToggle && vibrateToggle.checked && ('vibrate' in navigator)) {
    navigator.vibrate([150, 100, 150]);
  }
};

window.renderExercise = function() {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  document.getElementById("flex-routine-choice").value = todayLog.workoutDone;

  const exercisesContainer = document.getElementById("exercises-list-container");
  const cardioContainer = document.getElementById("cardio-workout-container");
  const routineTitle = document.getElementById("routine-title");
  const routineSubtitle = document.getElementById("routine-subtitle");
  const customPanel = document.getElementById("custom-exercise-creation-panel");
  
  if (window.activeRoutineTab === "Cardio" || todayLog.workoutDone === "Cardio") {
    exercisesContainer.classList.add("hidden");
    cardioContainer.classList.remove("hidden");
    customPanel.classList.add("hidden");
    routineTitle.textContent = "Acondicionamiento Cardiovascular";
    routineSubtitle.textContent = "Sesiones de elíptica o caminadora con inclinación.";
    return;
  }
  
  if (todayLog.workoutDone === "none" && window.activeRoutineTab !== "Personalizada") {
    exercisesContainer.classList.add("hidden");
    cardioContainer.classList.add("hidden");
    customPanel.classList.add("hidden");
    routineTitle.textContent = "Día de Descanso / Estiramiento";
    routineSubtitle.textContent = "Relájate, hidrátate y realiza pausas activas cada 30 minutos.";
    return;
  }
  
  exercisesContainer.classList.remove("hidden");
  cardioContainer.classList.add("hidden");
  
  const targetRoutineKey = (todayLog.workoutDone !== "none" && ["A", "B", "C", "Personalizada"].includes(todayLog.workoutDone)) ? todayLog.workoutDone : window.activeRoutineTab;
  
  if (targetRoutineKey === "Personalizada") {
    customPanel.classList.remove("hidden");
  } else {
    customPanel.classList.add("hidden");
  }
  
  const routine = window.appState.workoutPlan[targetRoutineKey];
  routineTitle.textContent = routine.name;
  routineSubtitle.textContent = routine.subtitle;
  
  exercisesContainer.innerHTML = "";
  
  if (routine.exercises.length === 0) {
    exercisesContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-secondary); font-style:italic;">No hay ejercicios registrados en esta rutina. Registra tus ejercicios manuales arriba.</span>`;
    return;
  }
  
  routine.exercises.forEach(ex => {
    const savedLog = todayLog.workoutLogged[ex.id] || { sets: [] };
    const activeWeight = window.appState.currentWeights[ex.id] !== undefined ? window.appState.currentWeights[ex.id] : ex.defaultWeight;
    const activeUnit = window.appState.currentUnits[ex.id] || "kg";
    
    const card = document.createElement("div");
    card.className = "ex-card";
    
    let isAllDone = savedLog.sets.length >= ex.targetSets && savedLog.sets.slice(0, ex.targetSets).every(s => s && s.completed);
    if (isAllDone) {
      card.classList.add("completed");
    }
    
    const hasPhoto = window.cachedMachineImages && window.cachedMachineImages[ex.id];
    let photoHTML = "";
    if (hasPhoto) {
      photoHTML = `<div class="ex-photo-preview-box" onclick="window.viewMachinePhoto('${ex.id}')"><img src="${window.cachedMachineImages[ex.id]}"></div>`;
    } else {
      photoHTML = `<div class="ex-photo-preview-box" style="cursor:default;"><i class="fa-solid fa-image"></i></div>`;
    }
    
    let setsHTML = "";
    for (let s = 1; s <= ex.targetSets; s++) {
      const setInfo = savedLog.sets[s - 1] || { weight: activeWeight, reps: ex.targetReps, completed: false };
      
      setsHTML += `
        <div class="ex-set-row" id="row-${ex.id}-set-${s}">
          <span class="ex-set-num">Serie ${s}</span>
          <div>
            <input type="number" step="0.5" class="ex-input-weight" id="w-${ex.id}-${s}" value="${setInfo.weight}" onchange="window.saveTemporarySetWeight('${ex.id}', ${s}, this.value)" ${setInfo.completed ? 'disabled' : ''}>
          </div>
          <div>
            <input type="number" class="ex-input-reps" id="r-${ex.id}-${s}" value="${setInfo.reps}" onchange="window.saveTemporarySetReps('${ex.id}', ${s}, this.value)" ${setInfo.completed ? 'disabled' : ''}>
          </div>
          <div>
            <button class="btn-check-set ${setInfo.completed ? 'active' : ''}" 
                    id="btn-${ex.id}-${s}"
                    onclick="window.toggleSetComplete('${ex.id}', ${s}, ${ex.targetSets}, '${ex.repsRange}')">
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="ex-header" style="align-items: center;">
        <div class="ex-name-group">
          <h4 style="font-size:0.95rem;">${ex.name}</h4>
          <span style="font-size:0.7rem; color:var(--text-secondary);">Objetivo: ${ex.targetSets} series de ${ex.repsRange} (${activeUnit})</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${photoHTML}
          <span class="ex-target-pill" style="font-size:0.62rem;">${ex.targetSets} Series</span>
        </div>
      </div>
      <div class="ex-log-area">
        <div class="ex-log-grid-header" style="font-size:0.62rem;">
          <span>Set</span>
          <span>Peso (${activeUnit})</span>
          <span>Reps / Seg</span>
          <span>Ok</span>
        </div>
        ${setsHTML}
      </div>
      
      <div class="ex-header-row-modifiers">
        <div class="set-count-controller">
          <span style="font-size:0.65rem; font-weight:700; color:var(--text-secondary);">Series:</span>
          <button class="btn-set-modifier" onclick="window.removeExerciseSet('${ex.id}')">-</button>
          <span style="font-size:0.75rem; font-weight:700;">${ex.targetSets}</span>
          <button class="btn-set-modifier" onclick="window.addExerciseSet('${ex.id}')">+</button>
        </div>
        
        <div style="margin-left: auto; display:flex; align-items:center; gap:8px;">
          <button class="btn-secondary" style="font-size:0.65rem; padding: 2px 6px;" onclick="window.toggleExerciseUnit('${ex.id}')">
            Unidad: ${activeUnit.toUpperCase()}
          </button>
          
          <label class="photo-uploader-label" title="Subir foto de máquina">
            <i class="fa-solid fa-camera"></i>
            <input type="file" accept="image/*" style="display:none;" onchange="window.uploadMachinePhoto(event, '${ex.id}')">
          </label>
        </div>
      </div>
    `;
    exercisesContainer.appendChild(card);
  });
};

window.addExerciseSet = function(exId) {
  let ex = null;
  ["A", "B", "C", "Personalizada"].forEach(rk => {
    if (window.appState.workoutPlan[rk] && window.appState.workoutPlan[rk].exercises) {
      const found = window.appState.workoutPlan[rk].exercises.find(e => e.id === exId);
      if (found) ex = found;
    }
  });
  
  if (ex) {
    ex.targetSets = Math.min(ex.targetSets + 1, 10);
    window.saveState();
    window.renderExercise();
  }
};

window.removeExerciseSet = function(exId) {
  let ex = null;
  ["A", "B", "C", "Personalizada"].forEach(rk => {
    if (window.appState.workoutPlan[rk] && window.appState.workoutPlan[rk].exercises) {
      const found = window.appState.workoutPlan[rk].exercises.find(e => e.id === exId);
      if (found) ex = found;
    }
  });
  
  if (ex && ex.targetSets > 1) {
    ex.targetSets -= 1;
    
    const todayStr = window.getTodayDateString();
    const todayLog = window.appState.history.find(h => h.date === todayStr);
    if (todayLog.workoutLogged[exId] && todayLog.workoutLogged[exId].sets) {
      if (todayLog.workoutLogged[exId].sets.length > ex.targetSets) {
        todayLog.workoutLogged[exId].sets.splice(ex.targetSets);
      }
    }
    
    window.saveState();
    window.renderExercise();
  }
};

window.toggleExerciseUnit = function(exId) {
  const currentUnit = window.appState.currentUnits[exId] || "kg";
  let nextUnit = "kg";
  
  if (currentUnit !== "kg" && currentUnit !== "lb") return;
  
  let weight = window.appState.currentWeights[exId] || 0;
  
  if (currentUnit === "kg") {
    nextUnit = "lb";
    weight = Math.round(weight * 2.20462 * 2) / 2;
  } else {
    nextUnit = "kg";
    weight = Math.round(weight * 0.453592 * 2) / 2;
  }
  
  window.appState.currentUnits[exId] = nextUnit;
  window.appState.currentWeights[exId] = weight;
  
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (todayLog && todayLog.workoutLogged && todayLog.workoutLogged[exId]) {
    todayLog.workoutLogged[exId].sets.forEach(set => {
      if (set && set.weight) {
        if (currentUnit === "kg") {
          set.weight = Math.round(set.weight * 2.20462 * 2) / 2;
        } else {
          set.weight = Math.round(set.weight * 0.453592 * 2) / 2;
        }
      }
    });
  }
  
  window.saveState();
  window.renderExercise();
};

window.saveTemporarySetWeight = function(exId, setNum, val) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged[exId]) todayLog.workoutLogged[exId] = { sets: [] };
  if (!todayLog.workoutLogged[exId].sets[setNum - 1]) {
    todayLog.workoutLogged[exId].sets[setNum - 1] = { weight: 0, reps: 0, completed: false };
  }
  todayLog.workoutLogged[exId].sets[setNum - 1].weight = parseFloat(val) || 0;
  window.saveState();
};

window.saveTemporarySetReps = function(exId, setNum, val) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged[exId]) todayLog.workoutLogged[exId] = { sets: [] };
  if (!todayLog.workoutLogged[exId].sets[setNum - 1]) {
    todayLog.workoutLogged[exId].sets[setNum - 1] = { weight: 0, reps: 0, completed: false };
  }
  todayLog.workoutLogged[exId].sets[setNum - 1].reps = parseInt(val) || 0;
  window.saveState();
};

window.toggleSetComplete = function(exId, setNum, totalSets, repsRange) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  const wInput = document.getElementById(`w-${exId}-${setNum}`);
  const rInput = document.getElementById(`r-${exId}-${setNum}`);
  const btn = document.getElementById(`btn-${exId}-${setNum}`);
  
  const weight = parseFloat(wInput.value) || 0;
  const reps = parseInt(rInput.value) || 0;
  
  if (!todayLog.workoutLogged[exId]) {
    todayLog.workoutLogged[exId] = { sets: [] };
  }
  
  const setsArray = todayLog.workoutLogged[exId].sets;
  const alreadyCompleted = setsArray[setNum - 1] && setsArray[setNum - 1].completed;
  
  if (!alreadyCompleted) {
    setsArray[setNum - 1] = { weight, reps, completed: true };
    btn.classList.add("active");
    wInput.disabled = true;
    rInput.disabled = true;
    
    window.triggerRestHapticVibration();
    
    let maxReps = 12;
    const numbersInReps = repsRange.match(/\d+/g);
    if (numbersInReps && numbersInReps.length > 0) {
      maxReps = parseInt(numbersInReps[numbersInReps.length - 1], 10);
    }
    
    let allSetsHitMax = true;
    for (let s = 1; s <= totalSets; s++) {
      const set = setsArray[s - 1];
      if (!set || !set.completed || set.reps < maxReps) {
        allSetsHitMax = false;
        break;
      }
    }
    
    if (allSetsHitMax && weight > 0) {
      const suggestedInc = (weight * 1.03).toFixed(1);
      const overloadWeight = (Math.ceil(suggestedInc * 2) / 2);
      
      window.appState.currentWeights[exId] = overloadWeight;
      window.saveState();
      
      const toast = document.getElementById("alert-overload");
      document.getElementById("toast-title").innerHTML = "¡Súper Fuerza, Sonia! 💪🎀";
      document.getElementById("toast-message").innerHTML = `¡Excelente gordis! Alcanzaste el máximo rango con <strong>${weight} ${window.appState.currentUnits[exId]}</strong>. Para tu próxima sesión, tu carga sube a <strong>${overloadWeight} ${window.appState.currentUnits[exId]}</strong> (+2% a +5% de sobrecarga progresiva).`;
      toast.classList.remove("hidden");
      
      setTimeout(() => {
        toast.classList.add("hidden");
      }, 7000);
    }
  } else {
    setsArray[setNum - 1] = { weight, reps, completed: false };
    btn.classList.remove("active");
    wInput.disabled = false;
    rInput.disabled = false;
  }
  
  window.checkWorkoutCompletion(todayLog);
  window.saveState();
  window.updateCompliance(todayStr);
  window.renderExercise();
  window.saveState();
};

window.checkWorkoutCompletion = function(todayLog) {
  const routineKey = window.activeRoutineTab;
  const routine = window.appState.workoutPlan[routineKey];
  if (!routine || !routine.exercises) return;
  
  let allDone = true;
  routine.exercises.forEach(ex => {
    const logged = todayLog.workoutLogged[ex.id];
    if (!logged || !logged.sets || logged.sets.length < ex.targetSets || !logged.sets.slice(0, ex.targetSets).every(s => s && s.completed)) {
      allDone = false;
    }
  });
  
  if (allDone && todayLog.workoutDone !== routineKey) {
    todayLog.workoutDone = routineKey;
    window.saveState();
    window.renderDashboard();
    window.showCuteAlert("¡Entrenamiento Completo! 💪🌸", `¡Felicidades gordis, terminaste la rutina del Día ${routineKey}! Eres una campeona.`, "🏆✨");
  }
};

window.uploadMachinePhoto = function(event, exId) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const maxDim = 300;
      let w = img.width;
      let h = img.height;
      
      if (w > h) {
        if (w > maxDim) {
          h = Math.round(h * maxDim / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round(w * maxDim / h);
          h = maxDim;
        }
      }
      
      canvas.width = w;
      canvas.height = h;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      
      window.saveMachinePhoto(exId, compressedBase64).then(() => {
        window.cachedMachineImages[exId] = compressedBase64;
        window.showCuteAlert("¡Foto Guardada! 📸🎀", "La foto de la máquina se cargó en la base de datos IndexedDB offline.", "✨");
        window.renderExercise();
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.viewMachinePhoto = function(exId) {
  const base64 = window.cachedMachineImages[exId];
  if (!base64) return;
  
  let exName = "Máquina";
  ["A", "B", "C", "Personalizada"].forEach(rk => {
    if (window.appState.workoutPlan[rk] && window.appState.workoutPlan[rk].exercises) {
      const found = window.appState.workoutPlan[rk].exercises.find(e => e.id === exId);
      if (found) exName = found.name;
    }
  });
  
  window.showCuteAlert(exName, `<div style="text-align:center;"><img src="${base64}" style="max-width:100%; border-radius:12px; border:3px solid var(--pink-medium);"></div>`, "📷");
};

// Bind Custom exercise addition triggers
document.addEventListener("DOMContentLoaded", () => {
  const customAddBtn = document.getElementById("btn-add-custom-exercise");
  if (customAddBtn) {
    customAddBtn.addEventListener("click", () => {
      const name = document.getElementById("custom-ex-name").value.trim();
      const sets = parseInt(document.getElementById("custom-ex-sets").value) || 3;
      const reps = document.getElementById("custom-ex-reps").value.trim() || "12";
      const unit = document.getElementById("custom-ex-unit").value;
      
      if (!name) {
        window.showCuteAlert("Nombre Requerido", "Ingresa un nombre para tu ejercicio personalizado, Sonia.", "😿");
        return;
      }
      
      const newId = "custom_" + Date.now();
      const newEx = {
        id: newId,
        name: name,
        targetSets: sets,
        targetReps: parseInt(reps) || 12,
        repsRange: reps,
        weightUnit: unit,
        defaultWeight: 10
      };
      
      if (!window.appState.workoutPlan.Personalizada) {
        window.appState.workoutPlan.Personalizada = { name: "Rutina Personalizada 🐾", subtitle: "Crea tu propia secuencia de ejercicios.", exercises: [] };
      }
      window.appState.workoutPlan.Personalizada.exercises.push(newEx);
      
      window.appState.currentWeights[newId] = 10;
      window.appState.currentUnits[newId] = unit;
      
      window.saveState();
      window.renderExercise();
      
      document.getElementById("custom-ex-name").value = "";
      document.getElementById("custom-ex-reps").value = "";
      
      window.showCuteAlert("¡Ejercicio Creado! 💪🐾", `Añadimos '${name}' a tu lista de ejercicios personalizados.`, "😻");
    });
  }
});
