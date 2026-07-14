/* ==========================================================================
   SONIA KITTYFIT - DIET & CLINICAL EQUIVALENTS LOGIC (diet.js)
   ========================================================================== */

let activeLookupCategory = null;

const categoryNames = {
  cereales: "Cereales sin grasa 🌾",
  verduras: "Verduras Frescas 🟢",
  frutas: "Frutas de Temporada 🍎",
  animal: "Proteínas de origen animal 🍗",
  leguminosas: "Leguminosas 🫘",
  leche: "Lácteos descremados 🥛",
  grasas: "Grasas sin proteína 🥑",
  cerealesGrasa: "Cereales con grasa 🍩",
  grasasProteina: "Grasas con proteína 🥜"
};

// Emoji repeated multiplier map
function getRepeatedEmojis(pKey, value) {
  const emojiMap = {
    verduras: "🥦",
    frutas: "🍎",
    cereales: "🍞",
    animal: "🍗",
    leguminosas: "🫘",
    leche: "🥛",
    grasas: "🥑",
    cerealesGrasa: "🍩",
    grasasProteina: "🥜"
  };
  const emoji = emojiMap[pKey] || "🌸";
  const count = Math.ceil(value) || 0;
  return emoji.repeat(count);
}

// Google Search query builder for equivalents
window.googleSearchExchange = function(term) {
  const query = encodeURIComponent(`equivalentes comida smae ${term}`);
  window.open(`https://www.google.com/search?q=${query}`, '_blank');
};

// Render Diet Screen (with Progress Rings and Meal Actions)
window.renderDiet = function() {
  document.querySelectorAll(".day-tab").forEach(tab => {
    if (tab.getAttribute("data-day") === window.currentDay) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
  
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  const todayTarget = window.getCaloricCyclingTarget(window.currentDay);
  document.getElementById("diet-cycling-desc").textContent = `Hoy es ${todayTarget.type}. Meta del día: ${todayTarget.kcal} kcal para control de grasa.`;
  document.getElementById("diet-target-kcal").textContent = `${todayTarget.kcal} kcal diarias`;
  
  const isAlto = ["Martes", "Jueves", "Sábado"].includes(window.currentDay);
  
  let targetPortions = {};
  window.appState.smaeTargets.forEach(t => {
    let base = t.target;
    if (isAlto && t.key === "cereales") base += 1;
    if (isAlto && t.key === "animal") base += 1;
    
    const offset = (todayLog.smaeOffsets && todayLog.smaeOffsets[t.key]) ? todayLog.smaeOffsets[t.key] : 0;
    targetPortions[t.key] = Math.max(0, base + offset);
  });
  
  document.getElementById("diet-target-macros").textContent = `🍗 ${todayTarget.p}g P | 🌾 ${todayTarget.c}g C | 🥑 ${todayTarget.f}g G`;
  
  // --- Render Portion Progress Summary Rings ---
  renderPortionSummaryRings(todayLog, targetPortions);
  
  // Populate Meals list for selected day
  const container = document.getElementById("meals-list-container");
  container.innerHTML = "";
  
  const dayMeals = window.appState.dietPlan[window.currentDay] || [];
  dayMeals.forEach((meal, index) => {
    const isCompleted = todayLog.mealsCompleted.includes(meal.name);
    const mealCard = document.createElement("div");
    const mealId = meal.name.replace(/\s+/g, '');
    mealCard.className = `meal-item-card ${isCompleted ? 'completed' : ''}`;
    mealCard.id = `meal-card-${mealId}`;
    
    const mealKey = meal.name.replace(/\s+/g, '');
    const pTargets = window.appState.mealPortions[mealKey] || {};
    
    let portionTagsHTML = "";
    Object.keys(pTargets).forEach(pKey => {
      const pVal = pTargets[pKey];
      if (pVal > 0) {
        let label = "";
        let chipClass = "";
        if (pKey === "verduras") { label = `🟢 ${pVal} Verduras`; chipClass = "chip-ver"; }
        if (pKey === "frutas") { label = `🍎 ${pVal} Frutas`; chipClass = "chip-fru"; }
        if (pKey === "cereales") { label = `🌾 ${pVal} Cereales s/g`; chipClass = "chip-cer"; }
        if (pKey === "animal") { label = `🍗 ${pVal} Proteína`; chipClass = "chip-pro"; }
        if (pKey === "leguminosas") { label = `🫘 ${pVal} Leguminosas`; chipClass = "chip-leg"; }
        if (pKey === "leche") { label = `🥛 ${pVal} Lácteos desc.`; chipClass = "chip-lac"; }
        if (pKey === "grasas") { label = `🥑 ${pVal} Grasas s/p`; chipClass = "chip-gra"; }
        if (pKey === "cerealesGrasa") { label = `🍩 ${pVal} Cereales c/g`; chipClass = "chip-cer"; }
        if (pKey === "grasasProteina") { label = `🥜 ${pVal} Grasas c/p`; chipClass = "chip-gra"; }
        
        portionTagsHTML += `<span class="portion-chip ${chipClass}">${label}</span>`;
      }
    });

    let altoText = "";
    if (isAlto && meal.name === "Comida") {
      altoText = `<span class="badge badge-yellow" style="font-size:0.55rem; padding: 2px 6px;">+1 Cereal +1 Proteína</span>`;
    }

    const consumedBtnLabel = isCompleted ? "✅ Consumido" : "Registrar como Consumido";
    const consumedBtnClass = isCompleted ? "btn-meal-consumed consumed" : "btn-meal-consumed";
    
    mealCard.innerHTML = `
      <div class="meal-header" onclick="toggleMealExpand('${mealId}')">
        <div class="meal-title-group">
          <div class="meal-names">
            <h4>${meal.name} ${altoText}</h4>
            <span>${meal.kcal} kcal ${isCompleted ? '<span class="meal-portions-consumed-badge">✅ Consumido</span>' : ''}</span>
          </div>
        </div>
        <div class="meal-toggle-icon"><i class="fa-solid fa-chevron-down"></i></div>
      </div>
      <div class="meal-body-content">
        <div class="meal-desc-box" style="font-weight:600;">${meal.description}</div>
        <div class="meal-portion-chips-row">
          ${portionTagsHTML}
        </div>
        <div class="meal-macros-pill-row">
          <span class="meal-macro-pill pill-kcal">⚡ ${meal.kcal} kcal</span>
          <span class="meal-macro-pill pill-p">🍗 ${meal.p}g Proteína</span>
          <span class="meal-macro-pill pill-c">🌾 ${meal.c}g Carbohidratos</span>
          <span class="meal-macro-pill pill-f">🥑 ${meal.g}g Grasas</span>
        </div>
        
        <div class="meal-actions-row">
          <button class="${consumedBtnClass}" id="consumed-btn-${mealId}" onclick="window.toggleMealComplete('${meal.name}')">
            <i class="fa-solid fa-check"></i> ${consumedBtnLabel}
          </button>
          <button class="btn-meal-voice" onclick="window.voiceModifyMeal('${meal.name}')" title="Modificar con Voz">
            <i class="fa-solid fa-microphone"></i> Modificar con Voz
          </button>
          <button class="btn-secondary" style="padding: 8px; font-size:0.65rem;" onclick="window.askAIChoice('${meal.name}')" title="Consultar Alternativas IA">
            <i class="fa-solid fa-robot"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(mealCard);
  });
  
  renderPantry();
  renderShoppingList();
};

// Render Portion Progress Summary Rings
function renderPortionSummaryRings(todayLog, targetPortions) {
  const container = document.getElementById("diet-portions-summary-container");
  if (!container) return;
  container.innerHTML = "";
  
  const ringCategories = [
    { key: "verduras", label: "Verduras", emoji: "🟢", ringClass: "ring-ver" },
    { key: "frutas", label: "Frutas", emoji: "🍎", ringClass: "ring-fru" },
    { key: "cereales", label: "Cereales", emoji: "🌾", ringClass: "ring-cer" },
    { key: "animal", label: "Proteína", emoji: "🍗", ringClass: "ring-pro" },
    { key: "leguminosas", label: "Legumbres", emoji: "🫘", ringClass: "ring-leg" },
    { key: "leche", label: "Lácteos", emoji: "🥛", ringClass: "ring-lac" },
    { key: "grasas", label: "Grasas", emoji: "🥑", ringClass: "ring-gra" }
  ];
  
  const eaten = todayLog.smaeEaten || {};
  
  ringCategories.forEach(cat => {
    const target = targetPortions[cat.key] || 0;
    const consumed = eaten[cat.key] || 0;
    const remaining = Math.max(0, target - consumed);
    const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
    
    const size = 48;
    const radius = 20;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - pct * circumference;
    
    const card = document.createElement("div");
    card.className = "portion-ring-card";
    card.onclick = () => window.viewPortionEquivalents(cat.key);
    card.innerHTML = `
      <svg class="portion-ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="portion-ring-bg" cx="${size/2}" cy="${size/2}" r="${radius}" />
        <circle class="portion-ring-fill ${cat.ringClass}" cx="${size/2}" cy="${size/2}" r="${radius}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          transform="rotate(-90 ${size/2} ${size/2})" />
        <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central"
          font-size="10" font-weight="700" fill="currentColor">${cat.emoji}</text>
      </svg>
      <span class="portion-ring-value">${remaining}/${target}</span>
      <span class="portion-ring-label">${cat.label}</span>
    `;
    container.appendChild(card);
  });
}

window.toggleMealExpand = function(mealId) {
  const card = document.getElementById(`meal-card-${mealId}`);
  if (card.classList.contains("open")) {
    card.classList.remove("open");
  } else {
    document.querySelectorAll(".meal-item-card").forEach(c => c.classList.remove("open"));
    card.classList.add("open");
  }
};

window.syncMealPortionsToSmae = function(mealName, isAdd, todayLog) {
  const mealsKeys = ["Desayuno", "ColaciónMatutina", "Comida", "ColaciónVespertina", "Cena"];
  const displayNames = ["Desayuno", "Colación Matutina", "Comida", "Colación Vespertina", "Cena"];
  const idx = displayNames.indexOf(mealName);
  if (idx !== -1) {
    const mKey = mealsKeys[idx];
    const isAlto = ["Martes", "Jueves", "Sábado"].includes(window.currentDay);
    const mealP = window.appState.mealPortions[mKey] || {};
    
    Object.keys(mealP).forEach(pKey => {
      let val = mealP[pKey] || 0;
      if (isAlto && mKey === "Comida" && pKey === "cereales") val += 1;
      if (isAlto && mKey === "Comida" && pKey === "animal") val += 1;
      
      if (isAdd) {
        todayLog.smaeEaten[pKey] = (todayLog.smaeEaten[pKey] || 0) + val;
      } else {
        todayLog.smaeEaten[pKey] = Math.max(0, (todayLog.smaeEaten[pKey] || 0) - val);
      }
    });
  }
};

window.toggleMealComplete = function(mealName) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  const mealId = mealName.replace(/\s+/g, '');
  const card = document.getElementById(`meal-card-${mealId}`);
  const btn = document.getElementById(`consumed-btn-${mealId}`);
  
  const isCompleted = todayLog.mealsCompleted.includes(mealName);
  
  if (!isCompleted) {
    todayLog.mealsCompleted.push(mealName);
    window.syncMealPortionsToSmae(mealName, true, todayLog);
    card.classList.add("completed");
  } else {
    todayLog.mealsCompleted = todayLog.mealsCompleted.filter(name => name !== mealName);
    window.syncMealPortionsToSmae(mealName, false, todayLog);
    card.classList.remove("completed");
  }
  
  window.saveState();
  window.updateCompliance(todayStr);
  window.renderDashboard();
  window.renderDiet();
  window.saveState();
};

window.voiceModifyMeal = function(mealName) {
  const micBtn = document.getElementById("btn-voice-mic");
  if (micBtn) {
    micBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    micBtn.style.animation = "pulseMic 1.4s 2";
    setTimeout(() => { micBtn.style.animation = ""; }, 3000);
  }
  
  if (window.voiceRecognition) {
    if (!window.isVoiceListening) {
      window.voiceRecognition.start();
    }
  } else {
    window.showCuteAlert("Voz no disponible", "El reconocimiento de voz no está disponible en este navegador.", "😿");
  }
};

window.viewPortionEquivalents = function(categoryKey) {
  activeLookupCategory = categoryKey;
  const modal = document.getElementById("portion-equivalents-modal");
  const title = document.getElementById("portion-equiv-title");
  const list = document.getElementById("portion-equiv-list");
  
  title.textContent = `Intercambios: ${categoryNames[categoryKey] || categoryKey}`;
  list.innerHTML = "";
  
  const equivalents = window.appState.exchangesDB[categoryKey] || ["Consulte su guía SMAE general."];
  equivalents.forEach(eq => {
    const li = document.createElement("li");
    li.className = "shopping-item-li";
    li.textContent = eq;
    list.appendChild(li);
  });
  
  modal.classList.add("open");
};

window.closePortionEquivModal = function() {
  document.getElementById("portion-equivalents-modal").classList.remove("open");
  activeLookupCategory = null;
};

document.getElementById("btn-quick-add-portion-comido").addEventListener("click", () => {
  if (activeLookupCategory) {
    window.changeEquiv(activeLookupCategory, 1);
    triggerRestHapticVibration();
    window.closePortionEquivModal();
  }
});

// Bind equivalents modal AI & Google search triggers
document.getElementById("btn-equiv-ask-ai").addEventListener("click", () => {
  if (activeLookupCategory) {
    const catName = categoryNames[activeLookupCategory] || activeLookupCategory;
    window.closePortionEquivModal();
    window.switchTab("chat");
    const inputEl = document.getElementById("chat-text-input");
    inputEl.value = `Dime alternativas ricas de equivalentes para el grupo de ${catName} según el SMAE.`;
    document.getElementById("chat-input-form").dispatchEvent(new Event("submit"));
  }
});

document.getElementById("btn-equiv-google").addEventListener("click", () => {
  if (activeLookupCategory) {
    const catName = categoryNames[activeLookupCategory] || activeLookupCategory;
    window.googleSearchExchange(catName);
  }
});

window.changeEquiv = function(categoryKey, delta) {
  const todayStr = window.getTodayDateString();
  const todayLog = window.appState.history.find(h => h.date === todayStr);
  
  if (!todayLog.smaeEaten[categoryKey]) todayLog.smaeEaten[categoryKey] = 0;
  
  const isAlto = ["Martes", "Jueves", "Sábado"].includes(window.currentDay);
  const targetObj = window.appState.smaeTargets.find(t => t.key === categoryKey);
  let baseTarget = targetObj ? targetObj.target : 1;
  if (isAlto && categoryKey === "cereales") baseTarget += 1;
  if (isAlto && categoryKey === "animal") baseTarget += 1;
  
  const currentOffset = (todayLog.smaeOffsets && todayLog.smaeOffsets[categoryKey]) ? todayLog.smaeOffsets[categoryKey] : 0;
  const currentTarget = Math.max(0, baseTarget + currentOffset);
  
  todayLog.smaeEaten[categoryKey] = Math.max(0, todayLog.smaeEaten[categoryKey] + delta);
  
  // Excess compensation offsets trigger
  if (todayLog.smaeEaten[categoryKey] > currentTarget) {
    const excess = todayLog.smaeEaten[categoryKey] - currentTarget;
    window.showCuteConfirm(
      "¿Compensar Exceso? ⚖️",
      `Te excediste en ${excess} ración(es) de ${targetObj.name}. ¿Quieres restarlo automáticamente del objetivo de tus siguientes comidas para mantenerte en balance hoy?`,
      () => {
        if (!todayLog.smaeOffsets[categoryKey]) todayLog.smaeOffsets[categoryKey] = 0;
        todayLog.smaeOffsets[categoryKey] -= excess;
        
        window.saveState();
        window.renderDiet();
        window.saveState();
        
        window.showCuteAlert("¡Compensación Aplicada! ⚖️🌸", `Restamos ${excess} a la meta restante de ${targetObj.name}.`, "✨");
      },
      "⚖️"
    );
  }
  
  window.saveState();
  window.updateCompliance(todayStr);
  window.renderDiet();
  window.saveState();
};

function renderShoppingList() {
  const shoppingContainer = document.getElementById("pantry-shopping-list");
  const countBadge = document.getElementById("shopping-missing-count");
  
  shoppingContainer.innerHTML = "";
  
  const ingredientKeywordsMap = {
    "huevo": "huevos",
    "claras": "claras de huevo",
    "tortilla": "tortillas de maíz",
    "pollo": "pechuga de pollo",
    "atún": "atún en agua",
    "arroz": "arroz cocido",
    "avena": "avena",
    "espinaca": "espinaca",
    "aguacate": "aguacate",
    "leche": "leche descremada",
    "yogurt": "yogurt natural",
    "yogur": "yogurt natural",
    "manzana": "manzana",
    "panela": "queso panela",
    "queso": "queso panela",
    "champiñones": "champiñones",
    "lechuga": "lechuga",
    "jitomate": "jitomate",
    "almendras": "almendras",
    "frijoles": "frijoles",
    "lentejas": "lentejas",
    "plátano": "plátano",
    "fresas": "fresas",
    "pera": "pera",
    "sandía": "sandía",
    "bistec": "bistec de res",
    "resMagro": "bistec de res",
    "garbanzos": "garbanzos",
    "pavo": "jamón de pavo",
    "jamón": "jamón de pavo",
    "pan": "pan integral",
    "brócoli": "brócoli",
    "melón": "melón",
    "papaya": "papaya",
    "nopales": "nopales",
    "nopal": "nopales",
    "jícama": "bastones de jícama",
    "granola": "granola",
    "nueces": "nueces",
    "nuez": "nueces"
  };
  
  const todayMeals = window.appState.dietPlan[window.currentDay] || [];
  let missingItems = [];
  
  todayMeals.forEach(meal => {
    const text = meal.description.toLowerCase();
    Object.keys(ingredientKeywordsMap).forEach(key => {
      if (text.includes(key)) {
        const mappedName = ingredientKeywordsMap[key];
        if (!window.appState.profile.pantry.includes(mappedName) && !missingItems.includes(mappedName)) {
          missingItems.push(mappedName);
        }
      }
    });
  });
  
  countBadge.textContent = `Faltan ${missingItems.length}`;
  
  if (missingItems.length === 0) {
    shoppingContainer.innerHTML = `<li style="font-size:0.75rem; color:var(--green-bright); font-style:italic; font-weight:700;">¡Tienes todo listo en tu alacena para el menú de hoy! 🎀</li>`;
    return;
  }
  
  missingItems.forEach(item => {
    const li = document.createElement("li");
    li.className = "shopping-item-li";
    li.innerHTML = `
      <span style="flex:1;">${item}</span>
      <button class="btn-primary-small" style="font-size:0.55rem; padding: 2px 6px;" onclick="window.addShoppingItemToPantry('${item}')">
        Comprar
      </button>
    `;
    shoppingContainer.appendChild(li);
  });
}

window.addShoppingItemToPantry = function(item) {
  if (!window.appState.profile.pantry.includes(item)) {
    window.appState.profile.pantry.push(item);
    window.saveState();
    window.renderDiet();
    window.showCuteAlert("¡Comprado! 🛒🎀", `Agregamos '${item}' a tu alacena, Sonia.`, "😻");
  }
};

function renderPantry() {
  const pantryContainer = document.getElementById("pantry-tags-container");
  pantryContainer.innerHTML = "";
  
  const count = window.appState.profile.pantry.length;
  document.getElementById("pantry-items-count").textContent = `${count} ingredientes`;
  
  if (count === 0) {
    pantryContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-secondary); font-style:italic;">Tu alacena está vacía. Ve a comprar algo, gordis...</span>`;
    return;
  }
  
  window.appState.profile.pantry.forEach((item, index) => {
    const tag = document.createElement("div");
    tag.className = "pantry-tag";
    tag.innerHTML = `
      <span>${item}</span>
      <button class="pantry-tag-remove-btn" onclick="window.removePantryItem(${index})">&times;</button>
    `;
    pantryContainer.appendChild(tag);
  });

  document.getElementById("pantry-store-checkbox").checked = window.appState.profile.canGoToStore;
  document.getElementById("pantry-budget").value = window.appState.profile.foodBudget;
}

window.removePantryItem = function(index) {
  window.appState.profile.pantry.splice(index, 1);
  window.saveState();
  renderPantry();
  renderShoppingList();
  window.saveState();
};

window.askAIChoice = function(mealName) {
  const dayMeals = window.appState.dietPlan[window.currentDay] || [];
  const mealObj = dayMeals.find(m => m.name === mealName);
  if (!mealObj) return;
  
  window.switchTab("chat");
  
  const inputEl = document.getElementById("chat-text-input");
  if (inputEl) {
    inputEl.value = `Dime alternativas ricas de equivalentes clínicos del SMAE para mi ${mealName}: "${mealObj.description}"`;
    document.getElementById("chat-input-form").dispatchEvent(new Event("submit"));
  }
};

window.autoAdjustMealPortionsToTarget = function() {
  const baseKcal = window.appState.profile.targetCaloriesBase || 1706;
  const originalBase = 1706;
  const scale = baseKcal / originalBase;
  
  // Scale mealPortions
  const mealsKeys = ["Desayuno", "ColaciónMatutina", "Comida", "ColaciónVespertina", "Cena"];
  mealsKeys.forEach(mKey => {
    const originalMealP = window.defaultSoniaData.mealPortions[mKey];
    if (originalMealP) {
      if (!window.appState.mealPortions[mKey]) window.appState.mealPortions[mKey] = {};
      Object.keys(originalMealP).forEach(pKey => {
        const origVal = originalMealP[pKey];
        // Scale and round to nearest 0.5 ración
        let scaledVal = Math.round(origVal * scale * 2) / 2;
        if (origVal > 0 && scaledVal === 0) scaledVal = 0.5;
        window.appState.mealPortions[mKey][pKey] = scaledVal;
      });
    }
  });
  
  // Recalculate daily recipes kcal and macros based on scaled portions
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  days.forEach(day => {
    const meals = window.appState.dietPlan[day];
    mealsKeys.forEach((mKey, idx) => {
      const meal = meals[idx];
      if (meal) {
        let mealKcal = 0, mealP = 0, mealC = 0, mealG = 0;
        const scaledP = window.appState.mealPortions[mKey] || {};
        Object.keys(scaledP).forEach(pKey => {
          const pVal = scaledP[pKey] || 0;
          const factors = window.smaeFactors[pKey] || { kcal: 0, p: 0, c: 0, g: 0 };
          mealKcal += pVal * factors.kcal;
          mealP += pVal * factors.p;
          mealC += pVal * factors.c;
          mealG += pVal * factors.g;
        });
        
        meal.kcal = Math.round(mealKcal);
        meal.p = Math.round(mealP);
        meal.c = Math.round(mealC);
        meal.g = Math.round(mealG);
      }
    });
  });
  
  window.saveState();
  window.showCuteAlert("Menú Ajustado 🍏✨", "Hemos recalculado y escalado las raciones y macros de todo tu menú semanal para cumplir tu nueva meta calórica.", "✨");
  
  if (window.activeTab === "diet") {
    window.renderDiet();
  }
};


