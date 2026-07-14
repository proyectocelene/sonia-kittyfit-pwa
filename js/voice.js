/* ==========================================================================
   SONIA KITTYFIT - SPEECH RECOGNITION & VOICE PARSING (voice.js)
   ========================================================================== */

window.voiceRecognition = null;
window.isVoiceListening = false;
window.pantryVoiceRecognition = null;
window.isPantryVoiceListening = false;

window.initVoiceRecognition = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const btn = document.getElementById("btn-voice-mic");
    if (btn) btn.style.display = "none";
    return;
  }
  
  window.voiceRecognition = new SpeechRecognition();
  window.voiceRecognition.lang = "es-MX";
  window.voiceRecognition.continuous = false;
  window.voiceRecognition.interimResults = false;
  
  window.voiceRecognition.onstart = () => {
    window.isVoiceListening = true;
    document.getElementById("btn-voice-mic").classList.add("btn-voice-mic-pulsing");
    document.getElementById("mic-icon").className = "fa-solid fa-stop";
    document.getElementById("mic-text").textContent = "Detener Dictado";
    document.getElementById("voice-transcription-box").classList.remove("hidden");
    document.getElementById("voice-text-result").textContent = "Escuchando lo que comiste...";
    document.getElementById("voice-loading").classList.add("hidden");
  };
  
  window.voiceRecognition.onend = () => {
    window.isVoiceListening = false;
    document.getElementById("btn-voice-mic").classList.remove("btn-voice-mic-pulsing");
    document.getElementById("mic-icon").className = "fa-solid fa-microphone";
    document.getElementById("mic-text").textContent = "Empezar a Dictar";
  };
  
  window.voiceRecognition.onerror = () => {
    window.isVoiceListening = false;
    document.getElementById("voice-transcription-box").classList.add("hidden");
    window.showCuteAlert("Error de Dictado 🎙️", "No logré capturar tu voz. Inténtalo de nuevo o escribe tus raciones.", "😿");
  };
  
  window.voiceRecognition.onresult = (event) => {
    const resultText = event.results[0][0].transcript;
    document.getElementById("voice-text-result").textContent = resultText;
    document.getElementById("voice-loading").classList.remove("hidden");
    window.parseDietSpeechWithAI(resultText);
  };
};

window.parseDietSpeechWithAI = async function(speechText) {
  const apiKey = window.appState.profile.deepseekApiKey;
  if (!apiKey) {
    document.getElementById("voice-loading").classList.add("hidden");
    window.showCuteAlert("Sin API Key", "El dictado clínico inteligente requiere tu DeepSeek API Key.", "😿");
    return;
  }
  
  const systemPrompt = `
    Eres un robot nutricionista clínico experto en el Sistema Mexicano de Alimentos Equivalentes (SMAE). El usuario te dicta qué comida consumió hoy.
    Identifica de forma inteligente los grupos de alimentos descritos en el texto y devuélvelos como un objeto JSON con las raciones exactas.
    Las claves del objeto JSON DEBEN ser exactamente:
    - cereales: Cereales sin grasa (ej: tortillas, arroz, avena, pan de caja, galletas habaneras)
    - verduras: Verduras (ej: espinacas, calabacitas, pepino, jitomate, nopales)
    - frutas: Frutas (ej: manzana, plátano, papaya, melón, fresas)
    - animal: Alimentos de origen animal / Proteínas bajas en grasa (ej: claras de huevo, pechuga de pollo, pescado, queso panela, atún en agua)
    - leguminosas: Leguminosas (ej: frijoles, lentejas, garbanzos)
    - leche: Lácteos descremados (ej: leche descremada, yogur griego natural sin azúcar)
    - grasas: Grasas sin proteína (ej: aguacate, aceite de oliva, aceite de canola)
    - cerealesGrasa: Cereales con grasa (ej: granola, galletas con relleno)
    - grasasProteina: Grasas con proteína (ej: nueces, almendras, semillas, cacahuates)

    Ejemplo de entrada: "Desayuné dos claras con jitomate, una tortilla de maíz y un café con media taza de leche descremada y un tercio de aguacate."
    Salida JSON esperada:
    {
      "animal": 1,
      "verduras": 0.5,
      "cereales": 1,
      "leche": 0.5,
      "grasas": 1
    }

    Devuelve estrictamente el objeto JSON plano de las raciones detectadas. No des explicaciones, ni introducciones ni código Markdown.
  `;
  
  try {
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
          { role: "user", content: speechText }
        ],
        temperature: 0.1
      })
    });
    
    const data = await response.json();
    document.getElementById("voice-loading").classList.add("hidden");
    
    if (data.choices && data.choices[0]) {
      const parsedRations = JSON.parse(data.choices[0].message.content.trim().replace(/```json/g, "").replace(/```/g, ""));
      const todayStr = window.getTodayDateString();
      const todayLog = window.appState.history.find(h => h.date === todayStr);
      
      let loggedDetails = [];
      Object.keys(parsedRations).forEach(key => {
        const value = parsedRations[key];
        if (value > 0) {
          if (!todayLog.smaeEaten[key]) todayLog.smaeEaten[key] = 0;
          todayLog.smaeEaten[key] += value;
          loggedDetails.push(`${key}: +${value}`);
        }
      });
      
      window.saveState();
      window.updateCompliance(todayStr);
      window.renderDiet();
      window.renderDashboard();
      window.saveState();
      
      window.showCuteAlert("¡Raciones Registradas! 🎙️🍓", `Interpretación IA exitosa:\n${loggedDetails.join("\n")}`, "😻");
    }
  } catch (e) {
    document.getElementById("voice-loading").classList.add("hidden");
    window.showCuteAlert("Error en IA 🎙️", "No pudimos interpretar tus raciones clínicas. Intenta de nuevo hablando claro o regístralas a mano.", "😿");
  }
};

window.initPantryVoiceRecognition = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const btn = document.getElementById("btn-pantry-voice-mic");
    if (btn) btn.style.display = "none";
    return;
  }
  
  window.pantryVoiceRecognition = new SpeechRecognition();
  window.pantryVoiceRecognition.lang = "es-MX";
  window.pantryVoiceRecognition.continuous = false;
  window.pantryVoiceRecognition.interimResults = false;
  
  window.pantryVoiceRecognition.onstart = () => {
    window.isPantryVoiceListening = true;
    document.getElementById("btn-pantry-voice-mic").classList.add("btn-voice-mic-pulsing");
    document.getElementById("btn-pantry-voice-mic").innerHTML = `<i class="fa-solid fa-stop"></i> Detener grabación`;
    document.getElementById("pantry-voice-transcription-box").classList.remove("hidden");
    document.getElementById("pantry-voice-text-result").textContent = "Escuchando inventario...";
    document.getElementById("pantry-voice-loading").classList.add("hidden");
  };
  
  window.pantryVoiceRecognition.onend = () => {
    window.isPantryVoiceListening = false;
    document.getElementById("btn-pantry-voice-mic").classList.remove("btn-voice-mic-pulsing");
    document.getElementById("btn-pantry-voice-mic").innerHTML = `<i class="fa-solid fa-microphone"></i> Dictar Alacena (Voz IA)`;
  };
  
  window.pantryVoiceRecognition.onerror = () => {
    window.isPantryVoiceListening = false;
    document.getElementById("pantry-voice-transcription-box").classList.add("hidden");
    window.showCuteAlert("Error de Dictado 🎙️", "No pude escucharte bien. Asegúrate de otorgar permisos de voz.", "😿");
  };
  
  window.pantryVoiceRecognition.onresult = (event) => {
    const resultText = event.results[0][0].transcript;
    document.getElementById("pantry-voice-text-result").textContent = resultText;
    document.getElementById("pantry-voice-loading").classList.remove("hidden");
    window.parsePantrySpeechWithAI(resultText);
  };
};

window.parsePantrySpeechWithAI = async function(speechText) {
  const apiKey = window.appState.profile.deepseekApiKey;
  if (!apiKey) {
    document.getElementById("pantry-voice-loading").classList.add("hidden");
    window.showCuteAlert("Sin API Key", "El dictado de alacena inteligente requiere tu DeepSeek API Key.", "😿");
    return;
  }
  
  const systemPrompt = `
    Eres un robot organizador de cocina. El usuario te dicta qué ingredientes tiene tirados en su cocina.
    Tradúcelos a una lista limpia de strings JSON. Ejemplo de entrada: "tengo aguacates pollo arroz y algo de claras", salida JSON: ["aguacate", "pechuga de pollo", "arroz cocido", "claras de huevo"].
    Utiliza preferentemente los nombres estándar que ya tenemos: huevos, claras de huevo, tortillas de maíz, pechuga de pollo, atún en agua, arroz cocido, avena, espinaca, aguacate, leche descremada, yogurt natural, manzana, queso panela, champiñones, lechuga, jitomate, almendras, frijoles, lentejas, fresas, jícama, granola, nueces.
    Devuelve estrictamente un array JSON plano de strings. Sin explicaciones ni markdown.
  `;
  
  try {
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
          { role: "user", content: speechText }
        ],
        temperature: 0.1
      })
    });
    
    const data = await response.json();
    document.getElementById("pantry-voice-loading").classList.add("hidden");
    
    if (data.choices && data.choices[0]) {
      const parsedArray = JSON.parse(data.choices[0].message.content.trim().replace(/```json/g, "").replace(/```/g, ""));
      let addedCount = 0;
      parsedArray.forEach(item => {
        const cleaned = item.toLowerCase().trim();
        if (cleaned && !window.appState.profile.pantry.includes(cleaned)) {
          window.appState.profile.pantry.push(cleaned);
          addedCount++;
        }
      });
      
      window.saveState();
      window.renderDiet();
      window.saveState();
      
      window.showCuteAlert("¡Alacena Actualizada! 🥫🎀", `Listo, agregamos ${addedCount} nuevo(s) ingrediente(s) a tu alacena.`, "😻");
    }
  } catch (e) {
    document.getElementById("pantry-voice-loading").classList.add("hidden");
    window.showCuteAlert("Error en IA 🎙️", "No pudimos interpretar tu inventario de alacena. Revisa tu conexión o escribe a mano.", "😿");
  }
};

// Bind voice buttons
document.addEventListener("DOMContentLoaded", () => {
  const btnVoice = document.getElementById("btn-voice-mic");
  if (btnVoice) {
    btnVoice.addEventListener("click", () => {
      if (!window.voiceRecognition) window.initVoiceRecognition();
      if (window.voiceRecognition) {
        if (window.isVoiceListening) window.voiceRecognition.stop();
        else window.voiceRecognition.start();
      }
    });
  }

  const btnPantry = document.getElementById("btn-pantry-voice-mic");
  if (btnPantry) {
    btnPantry.addEventListener("click", () => {
      if (!window.pantryVoiceRecognition) window.initPantryVoiceRecognition();
      if (window.pantryVoiceRecognition) {
        if (window.isPantryVoiceListening) window.pantryVoiceRecognition.stop();
        else window.pantryVoiceRecognition.start();
      }
    });
  }
});
