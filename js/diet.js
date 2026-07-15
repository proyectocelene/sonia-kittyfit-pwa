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
        if (pKey === "cereales") { label = `🌾 ${pVal} Carbohidratos s/g`; chipClass = "chip-cer"; }
        if (pKey === "animal") { label = `🍗 ${pVal} Proteína Baja en Grasa`; chipClass = "chip-pro"; }
        if (pKey === "leguminosas") { label = `🫘 ${pVal} Leguminosas`; chipClass = "chip-leg"; }
        if (pKey === "leche") { label = `🥛 ${pVal} Lácteos Descremados`; chipClass = "chip-lac"; }
        if (pKey === "grasas") { label = `🥑 ${pVal} Grasas Saludables`; chipClass = "chip-gra"; }
        if (pKey === "cerealesGrasa") { label = `🍩 ${pVal} Carbohidratos c/g`; chipClass = "chip-cer"; }
        if (pKey === "grasasProteina") { label = `🥜 ${pVal} Grasas c/proteína`; chipClass = "chip-gra"; }
        
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
            <span>Objetivo: ${meal.kcal} kcal ${isCompleted ? '<span class="meal-portions-consumed-badge">✅ Registrado</span>' : ''}</span>
          </div>
        </div>
        <div class="meal-toggle-icon"><i class="fa-solid fa-chevron-down"></i></div>
      </div>
      <div class="meal-body-content" style="padding: 10px;">
        <p style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Raciones Sugeridas:</p>
        <div class="meal-portion-chips-row" style="margin-bottom: 12px;">
          ${portionTagsHTML}
        </div>
        
        <textarea id="manual-meal-input-${mealId}" placeholder="¿Qué comiste en el ${meal.name.toLowerCase()}? Ej. 5 rebanadas de pizza..." style="width: 100%; min-height: 60px; padding: 10px; border-radius: 8px; border: 1px solid var(--pink-soft); margin-bottom: 12px; font-family: var(--font-body); resize: vertical;"></textarea>

        <div class="meal-actions-row" style="flex-wrap: wrap; gap: 8px;">
          <button class="btn-primary" style="flex: 1;" onclick="window.logMealWithAI('${meal.name}', '${mealId}')" title="Analizar y Registrar con IA">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Registrar con IA
          </button>
          <button class="btn-secondary" style="flex: 1;" onclick="window.searchGoogleRecipes('${meal.name}')" title="Buscar recetas en Google">
            <i class="fa-brands fa-google"></i> Buscar Receta
          </button>
          <button class="${consumedBtnClass}" id="consumed-btn-${mealId}" onclick="window.toggleMealComplete('${meal.name}')" title="Marcar perfecto (sin cambios)">
            <i class="fa-solid fa-check"></i> Perfecto
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

window.searchGoogleRecipes = function(mealName) {
  const mealKey = mealName.replace(/\s+/g, '');
  const pTargets = window.appState.mealPortions[mealKey] || {};
  
  const mapNames = {
    verduras: "Verduras",
    frutas: "Frutas",
    cereales: "Carbohidratos sin grasa",
    animal: "Proteína Baja en Grasa",
    leguminosas: "Leguminosas",
    leche: "Lácteos Descremados",
    grasas: "Grasas Saludables",
    cerealesGrasa: "Carbohidratos con grasa",
    grasasProteina: "Grasas con proteína"
  };

  let queryParts = [`receta sana para ${mealName} con`];
  Object.keys(pTargets).forEach(key => {
    if (pTargets[key] > 0) {
      queryParts.push(`${pTargets[key]} raciones de ${mapNames[key] || key}`);
    }
  });
  const url = `https://www.google.com/search?q=${encodeURIComponent(queryParts.join(', '))}`;
  window.open(url, '_blank');
};

window.logMealWithAI = async function(mealName, mealId) {
  const apiKey = window.appState.profile.deepseekApiKey;
  if (!apiKey) {
    window.showCuteAlert("Sin API Key", "Necesitas configurar tu API Key de DeepSeek en los Ajustes para usar la Inteligencia Artificial.", "😿");
    return;
  }
  
  const textArea = document.getElementById(`manual-meal-input-${mealId}`);
  const text = textArea ? textArea.value.trim() : "";
  if (!text) {
    window.showCuteAlert("Texto vacío", "Por favor, escribe qué comiste antes de presionar el botón.", "📝");
    return;
  }
  
  const btn = document.querySelector(`#meal-card-${mealId} .btn-primary`);
  const originalBtnHTML = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analizando...`;
  btn.disabled = true;
  
  const systemPrompt = `
    Eres un robot nutriólogo clínico experto en el Sistema Mexicano de Alimentos Equivalentes (SMAE).
    El usuario declara haber comido esto: "${text}".
    Identifica los grupos de alimentos y calcula las raciones consumidas.
    Las claves DEBEN ser exactamente: cereales, verduras, frutas, animal, leguminosas, leche, grasas, cerealesGrasa, grasasProteina.
    Toma en cuenta estas EQUIVALENCIAS DE COMIDAS COMUNES Y ANTOJOS:
    - Pollo Asado (1 pza grande): 3 animal, 1 grasas
    - Tacos de Carne Asada (3 pzas): 3 cereales, 3 animal, 1.5 grasas
    - Tacos de Birria (3 pzas): 3 cereales, 3 animal, 2 grasas
    - Pizza de Queso/Pepperoni (1 rebanada): 2 cereales, 1.5 animal, 2 grasas
    - Hamburguesa con Queso (1 pza): 3 cereales, 2.5 animal, 2.5 grasas
    - Tacos al Pastor (3 pzas): 3 cereales, 2 animal, 2 grasas, 0.5 frutas
    - Sándwich de Jamón y Panela: 2 cereales, 2 animal, 1 grasas
    - Chilaquiles con Huevo/Pollo (1 plato): 3 cereales, 2 animal, 2 grasas, 1 verduras
    Devuelve estrictamente un objeto JSON plano. Sin explicaciones ni código markdown.
    Ejemplo: {"animal": 2, "cereales": 1.5, "grasas": 1}
  `;
  
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.1
      })
    });
    
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const parsed = JSON.parse(data.choices[0].message.content.trim().replace(/```json/g, "").replace(/```/g, ""));
      const todayStr = window.getTodayDateString();
      const todayLog = window.appState.history.find(h => h.date === todayStr);
      
      const mealKey = mealName.replace(/\s+/g, '');
      const pTargets = window.appState.mealPortions[mealKey] || {};
      
      let excesses = [];
      let deficits = [];
      
      const allKeys = new Set([...Object.keys(parsed), ...Object.keys(pTargets)]);
      
      allKeys.forEach(key => {
        const eaten = parsed[key] || 0;
        const targetForMeal = pTargets[key] || 0;
        
        if (eaten > 0) {
          if (!todayLog.smaeEaten[key]) todayLog.smaeEaten[key] = 0;
          todayLog.smaeEaten[key] += eaten;
        }
        
        const difference = eaten - targetForMeal;
        const targetObj = window.appState.smaeTargets.find(t => t.key === key);
        const name = targetObj ? targetObj.name : key;
        
        if (difference > 0) {
          excesses.push({ key, name, amount: difference });
        } else if (difference < 0) {
          deficits.push({ key, name, amount: Math.abs(difference) });
        }
      });
      
      if (!todayLog.mealsCompleted.includes(mealName)) {
        todayLog.mealsCompleted.push(mealName);
      }
      
      window.saveState();
      window.updateCompliance(todayStr);
      window.renderDiet();
      window.renderDashboard();
      
      let message = "La IA calculó tus raciones.";
      let hasPrompt = false;

      if (excesses.length > 0) {
        hasPrompt = true;
        const excessText = excesses.map(e => `${e.amount} de ${e.name}`).join(", ");
        message += `\n\n🚨 **Te excediste** en el ${mealName} por: ${excessText}.\n\n¿Deseas que restemos este excedente de tus próximas comidas automáticamente para que no rompas tu meta de hoy?`;
        
        window.showCuteConfirm("¡Cálculo Exitoso pero te pasaste! ⚖️", message, () => {
          excesses.forEach(e => {
            if (!todayLog.smaeOffsets[e.key]) todayLog.smaeOffsets[e.key] = 0;
            todayLog.smaeOffsets[e.key] -= e.amount;
          });
          window.saveState();
          window.renderDiet();
          window.showCuteAlert("Balance Restaurado ⚖️", "Tus próximas comidas serán más ligeras para compensar tu desliz.", "✨");
        }, "⚖️");
      } 
      else if (deficits.length > 0) {
        hasPrompt = true;
        const deficitText = deficits.map(d => `${d.amount} de ${d.name}`).join(", ");
        message += `\n\n📉 **Comiste menos** de lo planeado en el ${mealName}. Faltaron: ${deficitText}.\n\n¿Deseas sumar estas raciones faltantes a tus próximas comidas de hoy para completar tus calorías?`;
        
        window.showCuteConfirm("¡Cálculo Exitoso pero te faltó comer! 🌸", message, () => {
          deficits.forEach(d => {
            if (!todayLog.smaeOffsets[d.key]) todayLog.smaeOffsets[d.key] = 0;
            todayLog.smaeOffsets[d.key] += d.amount;
          });
          window.saveState();
          window.renderDiet();
          window.showCuteAlert("Raciones Arrastradas 🌸", "Hemos sumado las raciones que te faltaron al resto de tu día.", "✨");
        }, "🌸");
      }
      
      if (!hasPrompt) {
        window.showCuteAlert("Registro Perfecto 🎯", "La IA calculó tus porciones y comiste exactamente lo que te tocaba. ¡Excelente!", "🍓");
      }
    }
  } catch (e) {
    window.showCuteAlert("Error en IA 🎙️", "No se pudo interpretar tu comida. Revisa tu conexión o tu API Key.", "😿");
  } finally {
    btn.innerHTML = originalBtnHTML;
    btn.disabled = false;
  }
};

