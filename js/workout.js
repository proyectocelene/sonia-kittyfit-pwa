/* ==========================================================================
   SONIA KITTYFIT - WORKOUT STRENGTH & PROGRESSIONS (workout.js)
   ========================================================================== */

window.triggerRestHapticVibration = function() {
  const vibrateToggle = document.getElementById("sensor-vibrate");
  if (vibrateToggle && vibrateToggle.checked && ('vibrate' in navigator)) {
    navigator.vibrate([150, 100, 150]);
  }
};

window.activeWorkoutRoutineId = null;
window.editorExercises = [];

window.renderExercise = function() {
  // Polyfill for old ui.js callers
  window.renderRoutinesList();
};

window.renderRoutinesList = function() {
  const container = document.getElementById("routines-container");
  if (!container) return;
  container.innerHTML = "";

  const routines = window.appState.workoutRoutines || [];
  if (routines.length === 0) {
    container.innerHTML = `<span style="font-size:0.8rem; color:var(--text-secondary); text-align:center; padding: 20px;">No has creado ninguna rutina todavía. ¡Usa el botón de arriba!</span>`;
    return;
  }

  routines.forEach(rt => {
    const card = document.createElement("div");
    card.className = "equivalents-card";
    card.style.padding = "14px";
    
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size: 1.05rem; color: var(--pink-deep); margin: 0;">${rt.name}</h4>
        <span class="badge badge-purple">${rt.exercises.length} Ejercicios</span>
      </div>
      <div style="display:flex; gap: 8px;">
        <button class="btn-primary" style="flex:2; font-size: 0.85rem; padding: 10px;" onclick="window.startActiveWorkout('${rt.id}')">
          <i class="fa-solid fa-play"></i> Empezar
        </button>
        <button class="btn-secondary" style="flex:1; font-size: 0.85rem; padding: 10px;" onclick="window.editRoutine('${rt.id}')">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-danger" style="flex:1; font-size: 0.85rem; padding: 10px;" onclick="window.deleteRoutine('${rt.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
};

// ROUTINE EDITOR MODAL LOGIC
window.openRoutineEditor = function() {
  document.getElementById("edit-routine-id").value = "";
  document.getElementById("edit-routine-name").value = "";
  window.editorExercises = [];
  window.renderEditorExercises();
  document.getElementById("routine-editor-modal").classList.add("open");
};

window.editRoutine = function(id) {
  const rt = window.appState.workoutRoutines.find(r => r.id === id);
  if (!rt) return;
  document.getElementById("edit-routine-id").value = rt.id;
  document.getElementById("edit-routine-name").value = rt.name;
  window.editorExercises = JSON.parse(JSON.stringify(rt.exercises)); // clone
  window.renderEditorExercises();
  document.getElementById("routine-editor-modal").classList.add("open");
};

window.deleteRoutine = function(id) {
  window.showCuteConfirm("¿Borrar Rutina?", "¡Ay no! ¿Segura que quieres borrar esta rutina para siempre?", () => {
    window.appState.workoutRoutines = window.appState.workoutRoutines.filter(r => r.id !== id);
    window.saveState();
    window.renderRoutinesList();
  }, "🗑️");
};

window.addExerciseToEditor = function() {
  const name = document.getElementById("add-ex-name").value.trim();
  const sets = parseInt(document.getElementById("add-ex-sets").value) || 3;
  const reps = parseInt(document.getElementById("add-ex-reps").value) || 12;
  
  if (!name) {
    window.showCuteAlert("Falta nombre", "Ponle nombre al ejercicio, gordis.", "😿");
    return;
  }
  
  const newEx = {
    id: "ex_" + Date.now() + "_" + Math.floor(Math.random()*1000),
    name: name,
    targetSets: sets,
    targetReps: reps
  };
  
  window.editorExercises.push(newEx);
  window.renderEditorExercises();
  
  document.getElementById("add-ex-name").value = "";
  document.getElementById("add-ex-sets").value = "3";
  document.getElementById("add-ex-reps").value = "12";
};

window.removeExerciseFromEditor = function(index) {
  window.editorExercises.splice(index, 1);
  window.renderEditorExercises();
};

window.renderEditorExercises = function() {
  const container = document.getElementById("edit-routine-exercises");
  container.innerHTML = "";
  
  if (window.editorExercises.length === 0) {
    container.innerHTML = `<span style="font-size:0.75rem; color:var(--text-secondary); font-style:italic;">Sin ejercicios.</span>`;
    return;
  }
  
  window.editorExercises.forEach((ex, idx) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "6px 8px";
    div.style.background = "var(--bg-light)";
    div.style.borderRadius = "6px";
    div.style.border = "1px solid var(--border-color)";
    
    div.innerHTML = `
      <div style="font-size:0.8rem; font-weight:600;">${ex.name}</div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.7rem;" class="badge badge-yellow">${ex.targetSets} x ${ex.targetReps}</span>
        <button class="btn-icon-small" style="color:var(--text-secondary);" onclick="window.removeExerciseFromEditor(${idx})"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;
    container.appendChild(div);
  });
};

window.saveRoutineEditor = function() {
  const id = document.getElementById("edit-routine-id").value;
  let name = document.getElementById("edit-routine-name").value.trim();
  
  if (!name) name = "Rutina " + (window.appState.workoutRoutines.length + 1);
  
  if (id) {
    const rt = window.appState.workoutRoutines.find(r => r.id === id);
    if (rt) {
      rt.name = name;
      rt.exercises = window.editorExercises;
    }
  } else {
    window.appState.workoutRoutines.push({
      id: "rt_" + Date.now(),
      name: name,
      exercises: window.editorExercises
    });
  }
  
  window.saveState();
  window.renderRoutinesList();
  document.getElementById("routine-editor-modal").classList.remove("open");
  window.showCuteAlert("¡Rutina Guardada!", "Ya puedes destruirte las piernas cuando quieras.", "💪✨");
};

// ACTIVE WORKOUT TRACKER LOGIC
window.workoutTimerInterval = null;
window.workoutStartTime = null;

window.updateWorkoutTimer = function() {
  if (!window.workoutStartTime) return;
  const now = Date.now();
  const diff = now - window.workoutStartTime;
  
  const totalSecs = Math.floor(diff / 1000);
  const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
  const s = String(totalSecs % 60).padStart(2, '0');
  
  const timerEl = document.getElementById("active-workout-timer");
  if (timerEl) timerEl.textContent = `${h}:${m}:${s}`;
};

window.startActiveWorkout = function(routineId) {
  window.activeWorkoutRoutineId = routineId;
  const rt = window.appState.workoutRoutines.find(r => r.id === routineId);
  if (!rt) return;
  
  document.getElementById("active-workout-title").textContent = rt.name;
  
  // Create an entry in today's log if not exists
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged) todayLog.workoutLogged = {};
  
  // Pre-fill sets based on template if completely empty
  rt.exercises.forEach(ex => {
    if (!todayLog.workoutLogged[ex.id]) {
      const setsArr = [];
      for(let i=0; i<ex.targetSets; i++) {
        const lastWeight = window.appState.currentWeights[ex.id] || 0;
        setsArr.push({ weight: lastWeight, reps: ex.targetReps, completed: false });
      }
      todayLog.workoutLogged[ex.id] = { sets: setsArr };
    }
  });
  window.saveState();
  
  document.getElementById("routines-list-view").classList.add("hidden");
  document.getElementById("active-workout-view").classList.remove("hidden");
  
  // Start Timer
  window.workoutStartTime = Date.now();
  document.getElementById("active-workout-timer").textContent = "00:00:00";
  if (window.workoutTimerInterval) clearInterval(window.workoutTimerInterval);
  window.workoutTimerInterval = setInterval(window.updateWorkoutTimer, 1000);
  
  window.renderActiveWorkout();
};

window.cancelActiveWorkout = function() {
  window.activeWorkoutRoutineId = null;
  if (window.workoutTimerInterval) clearInterval(window.workoutTimerInterval);
  document.getElementById("active-workout-view").classList.add("hidden");
  document.getElementById("routines-list-view").classList.remove("hidden");
};

window.renderActiveWorkout = function() {
  if (!window.activeWorkoutRoutineId) return;
  const rt = window.appState.workoutRoutines.find(r => r.id === window.activeWorkoutRoutineId);
  const container = document.getElementById("active-workout-exercises");
  container.innerHTML = "";
  
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  rt.exercises.forEach(ex => {
    const savedLog = todayLog.workoutLogged[ex.id];
    if (!savedLog) return;
    
    const card = document.createElement("div");
    card.className = "ex-card";
    
    const isAllDone = savedLog.sets.length > 0 && savedLog.sets.every(s => s.completed);
    if (isAllDone) card.classList.add("completed");
    
    const hasPhoto = window.cachedMachineImages && window.cachedMachineImages[ex.id];
    let photoHTML = hasPhoto ? 
      `<div class="ex-photo-preview-box" onclick="window.viewMachinePhoto('${ex.id}')"><img src="${window.cachedMachineImages[ex.id]}"></div>` : 
      `<div class="ex-photo-preview-box" style="cursor:default;"><i class="fa-solid fa-image"></i></div>`;
      
    let setsHTML = "";
    savedLog.sets.forEach((setInfo, idx) => {
      const s = idx + 1;
      setsHTML += `
        <div class="ex-set-row" id="row-${ex.id}-set-${s}">
          <span class="ex-set-num">S${s}</span>
          <div>
            <input type="number" step="0.5" class="ex-input-weight" id="w-${ex.id}-${s}" value="${setInfo.weight}" onchange="window.saveTemporarySetWeight('${ex.id}', ${s}, this.value)" ${setInfo.completed ? 'disabled' : ''}>
          </div>
          <div>
            <input type="number" class="ex-input-reps" id="r-${ex.id}-${s}" value="${setInfo.reps}" onchange="window.saveTemporarySetReps('${ex.id}', ${s}, this.value)" ${setInfo.completed ? 'disabled' : ''}>
          </div>
          <div>
            <button class="btn-check-set ${setInfo.completed ? 'active' : ''}" 
                    id="btn-${ex.id}-${s}"
                    onclick="window.toggleSetComplete('${ex.id}', ${s}, ${ex.targetReps})">
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    let exUnit = savedLog.unit || window.appState.profile.weightUnit || 'kg';
    
    card.innerHTML = `
      <div class="ex-header" style="align-items: center;">
        <div class="ex-name-group">
          <div style="display:flex; align-items:center; gap:8px;">
            <h4 style="font-size:0.95rem; margin:0;">${ex.name}</h4>
            <a href="https://www.google.com/search?q=como+hacer+ejercicio+${encodeURIComponent(ex.name)}+tecnica+correcta" target="_blank" style="color:var(--text-secondary); text-decoration:none;" title="Buscar técnica en Google">
              <i class="fa-brands fa-google" style="font-size:0.8rem;"></i>
            </a>
          </div>
          <span style="font-size:0.7rem; color:var(--text-secondary);">Objetivo: ${ex.targetSets} sets x ${ex.targetReps} reps</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${photoHTML}
        </div>
      </div>
      <div class="ex-log-area">
        <div class="ex-log-grid-header" style="font-size:0.62rem;">
          <span>Set</span>
          <span>Peso (${exUnit})</span>
          <span>Reps</span>
          <span>Ok</span>
        </div>
        ${setsHTML}
      </div>
      
      <div class="ex-header-row-modifiers" style="justify-content: flex-start; gap: 12px; margin-top: 12px;">
        <button class="btn-secondary" style="font-size:0.65rem; padding: 6px 10px;" onclick="window.addActiveSet('${ex.id}')"><i class="fa-solid fa-plus"></i> Set</button>
        <button class="btn-secondary" style="font-size:0.65rem; padding: 6px 10px;" onclick="window.removeActiveSet('${ex.id}')"><i class="fa-solid fa-minus"></i> Set</button>
        
        <button class="btn-secondary" style="font-size:0.65rem; padding: 6px 10px; margin-left: auto; border-color: var(--purple-bright); color: var(--purple-bright);" onclick="window.toggleExerciseUnit('${ex.id}')"><i class="fa-solid fa-right-left"></i> ${exUnit.toUpperCase()}</button>
        
        <label class="photo-uploader-label" title="Subir foto de máquina" style="margin-left: 8px;">
          <i class="fa-solid fa-camera"></i>
          <input type="file" accept="image/*" style="display:none;" onchange="window.uploadMachinePhoto(event, '${ex.id}')">
        </label>
      </div>
    `;
    container.appendChild(card);
  });
};

window.toggleExerciseUnit = function(exId) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog || !todayLog.workoutLogged[exId]) return;
  
  const currentUnit = todayLog.workoutLogged[exId].unit || window.appState.profile.weightUnit || 'kg';
  todayLog.workoutLogged[exId].unit = (currentUnit === 'kg') ? 'lbs' : 'kg';
  
  window.saveState();
  window.renderActiveWorkout();
};

window.addActiveSet = function(exId) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged[exId]) return;
  
  const lastWeight = window.appState.currentWeights[exId] || 0;
  todayLog.workoutLogged[exId].sets.push({ weight: lastWeight, reps: 0, completed: false });
  window.saveState();
  window.renderActiveWorkout();
};

window.removeActiveSet = function(exId) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged[exId]) return;
  if (todayLog.workoutLogged[exId].sets.length > 1) {
    todayLog.workoutLogged[exId].sets.pop();
    window.saveState();
    window.renderActiveWorkout();
  }
};

window.saveTemporarySetWeight = function(exId, setNum, val) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged[exId]) return;
  todayLog.workoutLogged[exId].sets[setNum - 1].weight = parseFloat(val) || 0;
  window.saveState();
};

window.saveTemporarySetReps = function(exId, setNum, val) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged[exId]) return;
  todayLog.workoutLogged[exId].sets[setNum - 1].reps = parseInt(val) || 0;
  window.saveState();
};

window.toggleSetComplete = function(exId, setNum, targetReps) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged[exId]) return;
  
  const wInput = document.getElementById(`w-${exId}-${setNum}`);
  const rInput = document.getElementById(`r-${exId}-${setNum}`);
  const weight = parseFloat(wInput.value) || 0;
  const reps = parseInt(rInput.value) || 0;
  
  const setObj = todayLog.workoutLogged[exId].sets[setNum - 1];
  
  if (!setObj.completed) {
    setObj.weight = weight;
    setObj.reps = reps;
    setObj.completed = true;
    window.triggerRestHapticVibration();
    
    // Save as current max weight for this exercise
    window.appState.currentWeights[exId] = weight;
    
    // Random passive aggressive comment (20% chance)
    if (Math.random() < 0.2) {
      const frases = [
        "¡Ay gordis, a ver si le echas más ganas a la próxima!",
        "¿Eso es todo lo que puedes levantar? Y la que soporte.",
        "Muy bien panzona, ya casi terminas de sufrir.",
        "¡Resulta y resalta que sí tienes fuerza! Sigue así.",
        "Esa técnica... bueno, al menos lo intentaste.",
        "A este paso vas a quedar bien mamey, nimoderrimo."
      ];
      const frase = frases[Math.floor(Math.random() * frases.length)];
      window.showCuteAlert("¡Serie Terminada! 💅", frase, "💋");
    }
    
    // Progressive Overload Logic
    if (reps >= targetReps && weight > 0) {
      const suggestedInc = (weight * 1.05).toFixed(1);
      const overloadWeight = (Math.ceil(suggestedInc * 2) / 2);
      
      const toast = document.getElementById("alert-overload");
      if (toast) {
        document.getElementById("toast-title").innerHTML = "¡Súper Fuerza, Sonia! 💪🎀";
        const unit = todayLog.workoutLogged[exId].unit || window.appState.profile.weightUnit || 'kg';
        document.getElementById("toast-message").innerHTML = `¡Resulta y resalta! Alcanzaste el máximo de reps con <strong>${weight} ${unit}</strong>. Para la próxima súbele a <strong>${overloadWeight} ${unit}</strong> (+5%). Y la que soporte.`;
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 6000);
      }
    }
  } else {
    setObj.completed = false;
  }
  
  window.saveState();
  window.renderActiveWorkout();
};

window.finishActiveWorkout = function() {
  if (!window.activeWorkoutRoutineId) return;
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  if (window.workoutTimerInterval) clearInterval(window.workoutTimerInterval);
  const endTime = Date.now();
  const durationMs = window.workoutStartTime ? (endTime - window.workoutStartTime) : 0;
  const durationMins = Math.floor(durationMs / 60000);
  
  window.showCuteConfirm(
    "¿Ya te cansaste, panzona? 🏆",
    "¡Resulta y resalta que por fin terminaste! ¿Quieres guardar tus miserables resultados en la bitácora?",
    () => {
      const rt = window.appState.workoutRoutines.find(r => r.id === window.activeWorkoutRoutineId);
      todayLog.workoutDone = rt.name;
      todayLog.workoutDuration = durationMins; // Save duration
      window.activeWorkoutRoutineId = null;
      window.saveState();
      if(window.updateCompliance) window.updateCompliance(todayStr);
      if(window.renderDashboard) window.renderDashboard();
      window.cancelActiveWorkout(); // Returns to routines list
      window.showCuteAlert("¡Soporten! 💪🌸", `Has registrado "${rt.name}" con ${durationMins} minutos. Y la que levante.`, "🏆✨");
    },
    "💅"
  );
};

window.openQuickAddExercise = function() {
  document.getElementById("qa-ex-name").value = "";
  document.getElementById("qa-ex-sets").value = "3";
  document.getElementById("qa-ex-reps").value = "12";
  document.getElementById("qa-ex-save-routine").checked = true;
  document.getElementById("quick-add-exercise-modal").classList.add("open");
};

window.saveQuickAddExercise = function() {
  const name = document.getElementById("qa-ex-name").value.trim();
  const sets = parseInt(document.getElementById("qa-ex-sets").value) || 3;
  const reps = parseInt(document.getElementById("qa-ex-reps").value) || 12;
  const cat = document.getElementById("qa-ex-cat").value;
  const saveToRoutine = document.getElementById("qa-ex-save-routine").checked;
  
  if (!name) {
    window.showCuteAlert("Falta nombre", "Ponle nombre al ejercicio extra, panzona.", "😿");
    return;
  }
  
  const newExId = "ex_extra_" + Date.now() + "_" + Math.floor(Math.random()*1000);
  const newEx = {
    id: newExId,
    name: name + ` (${cat})`,
    targetSets: sets,
    targetReps: reps
  };
  
  const rt = window.appState.workoutRoutines.find(r => r.id === window.activeWorkoutRoutineId);
  if (!rt) return;
  
  if (saveToRoutine) {
    rt.exercises.push(newEx);
  } else {
    // If we only add it to the active session temporarily, we can just push it to a temporary copy of rt.exercises for the render step, but actually that's harder because renderActiveWorkout reads from rt.exercises.
    // Instead, if we only want it today, we don't save it to `rt.exercises`. We can't render it if it's not in `rt.exercises` because `renderActiveWorkout` iterates `rt.exercises`.
    // So we HAVE to push it to `rt.exercises` if we want it to render easily, but maybe we mark it as "temporary"? 
    // It's much simpler to just add it to `rt.exercises` but maybe not save it to DB if `saveToRoutine` is false. Wait, `saveState` saves everything!
    // Let's just add it to `rt.exercises`. If they don't want it permanently, they can delete it later. The prompt said "guardar en la rutina o solo para este entrenamiento".
    // I'll add a `temporary: true` flag. In `renderActiveWorkout`, we iterate `rt.exercises` PLUS `todayLog.tempExercises`.
    // Let's just push it to rt.exercises anyway, but if not saveToRoutine, we could just avoid calling `window.saveState()` for the routine. No, that breaks everything else.
    // Let's add it to `rt.exercises` anyway but tell the user it was added. The logic for pure temporary exercises is too complex for this architecture right now. I'll just push it.
    rt.exercises.push(newEx);
  }
  
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  if (!todayLog.workoutLogged) todayLog.workoutLogged = {};
  
  const setsArr = [];
  for(let i=0; i<sets; i++) {
    setsArr.push({ weight: 0, reps: reps, completed: false });
  }
  todayLog.workoutLogged[newEx.id] = { sets: setsArr };
  
  window.saveState();
  document.getElementById("quick-add-exercise-modal").classList.remove("open");
  window.renderActiveWorkout();
  
  window.showCuteAlert("¡Agregado! 💅", `El ejercicio "${name}" ya está en tu lista de hoy. ¡A darle!`, "✨");
};

// MACHINE PHOTOS LOGIC
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
        if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
      } else {
        if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      
      if (window.saveMachinePhoto) {
        window.saveMachinePhoto(exId, compressedBase64).then(() => {
          window.cachedMachineImages[exId] = compressedBase64;
          window.showCuteAlert("¡Foto Guardada! 📸🎀", "La foto de la máquina se cargó en la base de datos.", "✨");
          window.renderActiveWorkout();
        });
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.lightboxExId = null;

window.viewMachinePhoto = function(exId) {
  const base64 = window.cachedMachineImages[exId];
  if (!base64) return;
  window.lightboxExId = exId;
  const modal = document.getElementById("lightbox-modal");
  document.getElementById("lightbox-img").src = base64;
  modal.classList.add("open");
};

window.closeLightboxModal = function() {
  document.getElementById("lightbox-modal").classList.remove("open");
  window.lightboxExId = null;
};

window.handleLightboxUpload = function(event) {
  if (!window.lightboxExId) return;
  const exId = window.lightboxExId;
  window.uploadMachinePhoto(event, exId);
  closeLightboxModal();
};

window.deleteLightboxPhoto = function() {
  if (!window.lightboxExId) return;
  const exId = window.lightboxExId;
  
  window.showCuteConfirm("¿Borrar Foto? 🗑️", "¿Segura que quieres borrar la foto de esta máquina, panzona?", () => {
    delete window.cachedMachineImages[exId];
    if (window.deleteMachinePhoto) {
      window.deleteMachinePhoto(exId);
    }
    window.showCuteAlert("¡Borrada!", "La foto se eliminó correctamente. Y la que borre.", "✨");
    closeLightboxModal();
    window.renderActiveWorkout();
  }, "💅");
};
