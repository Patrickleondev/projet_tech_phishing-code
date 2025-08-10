// L'api de virus Total
const API_KEY = "f9ad386ec18ff661a32903cd2aa49c52752ed7625257bf15d8f4873bdace4cf7";

// Simple i18n dictionary (FR and Eʋe)
const I18N = {
  fr: {
    scan_url_title: "Scanner une URL",
    url_label: "Entrez une URL (ex: https://example.com)",
    url_help: "Collez le lien suspect pour vérifier sa sécurité.",
    scan_url_btn: "Scanner l’URL",
    scan_file_title: "Scanner un fichier",
    file_label: "Choisissez un fichier (max 32 Mo)",
    file_help: "Téléversez un fichier pour détection de menaces.",
    scan_file_btn: "Scanner le fichier",
    learn_title: "Comprendre le phishing",
    chatbot_title: "Assistant AntiPhish",
    chatbot_input_label: "Votre message",
    chatbot_send: "Envoyer",
    full_report_title: "Rapport détaillé",
    msg_enter_url: "Veuillez entrer une URL !",
    msg_valid_url: "Veuillez entrer une URL valide (ex: https://example.com)",
    msg_submitting_url: "Envoi de l’URL pour analyse…",
    msg_getting_results: "Récupération des résultats…",
    msg_select_file: "Veuillez sélectionner un fichier !",
    msg_file_too_big: "La taille ne doit pas dépasser 32 Mo",
    msg_uploading_file: "Téléversement du fichier…",
    msg_analyzing: (name, secs) => `Analyse de ${name || 'l’URL'}… (${secs}s restantes)`,
    msg_analysis_failed: "Analyse échouée",
    msg_analysis_timeout: "Délai dépassé — veuillez réessayer",
    msg_invalid_response: "Réponse invalide",
    scan_report: "Rapport d’analyse",
    verdict: "Verdict",
    detection_rate: (pct) => `${pct}% de détection`,
    view_full_report: "Voir le rapport détaillé",
    no_details: "Pas de détails disponibles",
    malicious: "Malveillant",
    suspicious: "Suspect",
    harmless: "Sain",
    undetected: "Non détecté",
  },
  ewe: {
    scan_url_title: "Fàƒlia ɖe URL",
    url_label: "Ɖe URL aɖe (ex: https://example.com)",
    url_help: "Tɔ ɖe wòdiŋkope ƒe link la tso gbɔ ɖe ŋkɔe ŋu le eme.",
    scan_url_btn: "Fàƒlia URL la",
    scan_file_title: "Fàƒlia ɖe ƒaɛl",
    file_label: "Tia ƒaɛl aɖe (max 32 Mo)",
    file_help: "Tia ƒaɛl la kɔ ɖe agbagba ƒe nyawo ŋu le eme.",
    scan_file_btn: "Fàƒlia ƒaɛl la",
    learn_title: "Lé phishing ɖoɖo",
    chatbot_title: "AntiPhish ƒe ƒeɖekɔnu",
    chatbot_input_label: "Wò biabia",
    chatbot_send: "Gblɔna",
    full_report_title: "Nyatakakɛkpui dziɖuɖu",
    msg_enter_url: "Ta Ɖe URL aɖe!",
    msg_valid_url: "Ɖe URL si le xexea me (ex: https://example.com)",
    msg_submitting_url: "Medzea URL la leɖeɖeɖe…",
    msg_getting_results: "Medze anye ƒe ɖoɖo…",
    msg_select_file: "Tia ƒaɛl aɖe!",
    msg_file_too_big: "Ƒeƒe la mena 32 Mo dzi",
    msg_uploading_file: "Mekɔ ƒaɛl la ɖe dzi…",
    msg_analyzing: (name, secs) => `Medze ${name || 'URL'} la ƒe nyawo ɖo… (${secs}s hã ƒe ɖoɖo)`,
    msg_analysis_failed: "Dziɖuɖu la meɖe asi",
    msg_analysis_timeout: "Xɔse ƒe ɣa ɖe dzi — na ɖoɖo ɖe eme aɖe",
    msg_invalid_response: "Nya meɖe asi",
    scan_report: "Dziɖuɖu ƒe akɔnta",
    verdict: "Akpɔ",
    detection_rate: (pct) => `${pct}% ƒe kpɔɖeŋu`,
    view_full_report: "Dze nyatakakɛkpui ɖe eme",
    no_details: "Nya bubu meli ɖe eme o",
    malicious: "Mɔnuŋlɔla",
    suspicious: "Aƒeɖe-ɖeŋu",
    harmless: "Fɔfɔ",
    undetected: "Mekpɔ o",
  }
};

let currentLang = 'fr';
const getText = (key, ...args) => {
  const entry = I18N[currentLang][key];
  return typeof entry === 'function' ? entry(...args) : (entry || key);
};

// Apply i18n to elements with data-i18n
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const text = getText(key);
    if (text) el.textContent = text;
  });
}

// Fonctions pour obtenir le DOM par l'ID
const getElement = id => document.getElementById(id);

// Mise a jour des resultats avec le contenu
const updateResult = (content, display = true) =>{
    const result = getElement('result');
    result.style.display = display ? 'block' : 'none';
    result.innerHTML = content;
};

// Les spinners et les messages
const showLoading = message => updateResult(`
    <div class="loading">
        <p>${message}</p>
        <div class="spinner"></div>
    </div>
    `);

//Messages et erreurs
const showError = message => updateResult(`<p class="error">${message}</p>`);

//Fontions pour authentifier les requetes API
async function makeRequest(url, options) {
    // Initialiser options si undefined
    options = options || {};
    
    try {
        const response = await fetch(url, { 
            ...options, 
            headers: {
                "x-apikey": API_KEY,
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                error: { message: response.statusText }
            }));
            throw new Error(
                error.error?.message || 
                error.message || 
                'Request failed'
            );
        }

        return response.json();
    } catch (error) {
        throw new Error(`Network error: ${error.message}`);
    }
}

//Proccessus de scanning avec virus total
async function scanURL() {
    const url = getElement('urlInput').value.trim();
    if (!url) return showError(getText('msg_enter_url'));

    try{
        new URL(url);//Valid URL format
    }catch{
        return showError(getText('msg_valid_url'));
    }
    
    try{
        showLoading(getText('msg_submitting_url'));

        const encodedUrL = encodeURIComponent(url);
        
        //Soumettre l'URL a VT
        const submitResult = await makeRequest("https://www.virustotal.com/api/v3/urls", 
           { method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/x-www-form-urlencoded"
            },
            body: `url=${encodedUrL}`
    });

    if(!submitResult.data?.id){
        throw new Error("Failed to get analysis ID");
    }

    //Delaie avant les resultats
    await new Promise(resolve => setTimeout(resolve, 3000));

    showLoading(getText('msg_getting_results'));
    await pollAnalysisResults(submitResult.data.id);
    }catch (error){
        showError(`Error: ${error.message}`);
    }    
}

//Handle le processus de scanning des fichiers
async function scanFile() {
    const file = getElement('fileInput').files[0];
    if(!file) return showError(getText('msg_select_file'));
    if (file.size > 32*1024*1024) return showError(getText('msg_file_too_big'));

    try{
        showLoading(getText('msg_uploading_file'));

        const formData = new FormData();
        formData.append("file", file);

        //Upload file to VirusTotal
        const uploadResult = await makeRequest("https://www.virustotal.com/api/v3/files", {
            method: "POST",
            body: formData
        });

        if(!uploadResult.data?.id){
            throw new Error(" Failed to get file ID");
        }

        //Delai avant le resultat
        await new Promise(resolve => setTimeout(resolve, 3000));

        showLoading(getText('msg_getting_results'));
        const analysis = await makeRequest(`https://www.virustotal.com/api/v3/analyses/${uploadResult.data.id}`);
        
        if(!analysis.data?.id){
            throw new Error("Failed to get analysis results!");
        }

        await pollAnalysisResults(analysis.data.id, file.name);
    }catch (error){
        showError(`Error: ${error.message}`);
    }
}

//Recoomencer au moment d'echec
async function pollAnalysisResults(analysisId, fileName = '') {
    const maxAttempts = 20;
    let attempts = 0;
    let interval = 2000;

    while(attempts < maxAttempts) {
        try{
           showLoading(getText('msg_analyzing')(fileName, ((maxAttempts - attempts) * interval / 1000).toFixed(0)));

            const report = await makeRequest(`https://www.virustotal.com/api/v3/analyses/${analysisId}`);
            const status = report.data?.attributes?.status;

            if(!status) throw new Error(getText('msg_invalid_response'));

            if(status === "completed"){
                showFormattedResult(report);
                break;
            }

             if(status === "failed"){
                throw new Error(getText('msg_analysis_failed'));
            }

            if(++attempts >= maxAttempts){
                throw new Error(getText('msg_analysis_timeout'));
            }

            //Increase interval between retries
            interval = Math.min(interval * 1.5, 8000);
            await new Promise(resolve => setTimeout( resolve, interval));
        }catch (error){
            showError(`Error: ${error.message}`);
            break; 
        }
    }
}

//Formats and displays analysis results in the UI
function showFormattedResult(data) {
    if (!data?.data?.attributes?.stats) return showError(getText('msg_invalid_response'));

    const stats = data.data.attributes.stats;
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    if (!total) return showError(getText('msg_invalid_response'));

    const getPercent = val => ((val / total) * 100).toFixed(1);

    const categories = {
        malicious: { color: 'malicious', label: getText('malicious') },
        suspicious: { color: 'suspicious', label: getText('suspicious') },
        harmless: { color: 'safe', label: getText('harmless') },
        undetected: { color: 'undetected', label: getText('undetected') }
    };

    const percents = Object.keys(categories).reduce((acc, key) => {
        acc[key] = getPercent(stats[key]);
        return acc;
    }, {});

    const verdict = stats.malicious > 0 ? getText('malicious') : 
                   stats.suspicious > 0 ? getText('suspicious') : getText('harmless');
                   
    const verdictClass = stats.malicious > 0 ? "malicious" : 
                        stats.suspicious > 0 ? "suspicious" : "safe";

    updateResult(`
        <h3>${getText('scan_report')}</h3>
        <div class="scan-stats">
            <p><strong>${getText('verdict')}:</strong> <span class="${verdictClass}">${verdict}</span></p>
            <div class="progress-section">
                <div class="progress-label">
                    <span>Detection Result</span>
                    <span class="progress-percent">${getText('detection_rate')(percents.malicious)}</span>
                </div>
                <div class="progress-stacked"> 
                    ${Object.entries(categories).map(([key, { color }]) => `
                        <div class="progress-bar ${color}" style="width: ${percents[key]}%" title="${categories[key].label}: ${stats[key]} (${percents[key]}%)">
                            <span class="progress-label-overlay">${stats[key]}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="progress-legend">
                    ${Object.entries(categories).map(([key, {color, label}]) => `
                        <div class="legend-item">
                            <div class="legend-color ${color}"></div>
                            <span>${label} (${percents[key]}%)</span>
                        </div>
                    `).join('')} 
                </div>
            </div>
            <div class="detection-details">
                ${Object.entries(categories).map(([key, {color, label}]) => `
                    <div class="detail-item ${color}">
                        <span class="detail-label">${label}</span>
                        <span class="detail-value">${stats[key]}</span>
                        <span class="detail-percent">${percents[key]}%</span>
                    </div>        
                `).join('')}
            </div>
            <button onclick="showFullReport(this.getAttribute('data-report'))" data-report='${JSON.stringify(data)}'>${getText('view_full_report')}</button>
    `);

    setTimeout(() => {
        const progressStacked = getElement('result').querySelector('.progress-stacked');
        if (progressStacked) progressStacked.classList.add('animate');
    }, 1000);
}

//Displays as detailled report modal with engine-by-engine detecttion results
function showFullReport(reportData){
    const data = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;
    const modal = getElement("fullReportModal");
    const results = data.data?.attributes?.results || {};

    getElement("fullReportContent").innerHTML = `
        <h3>${getText('full_report_title')}</h3>
        ${results ?`
        <table>
            <tr><th>Engine</th><th>Result</th></tr>
            ${Object.entries(results).map(([engine, {category}]) => `
                <tr>
                    <td>${engine}</td>
                    <td class="${category === "malicious" ? "malicious" : category === "suspicious" ? "suspicious" : "safe"}">${category}</td>
                </tr>    
            `).join('')}
        </table>
        ` : `<p>${getText('no_details')}</p>`}
    `;

    modal.style.display = "block";
    modal.offsetHeight;
    modal.classList.add("show");
}

// Close the full report model
const closeModal = () => {
        const modal = getElement("fullReportModal");
        modal.classList.remove("show");
        setTimeout(() => modal.style.display = "none", 300);
}

// Chatbot logic (OpenRouter via backend)
async function streamChatbotResponse(userText) {
  const controller = new AbortController();
  const messages = [
    { role: 'system', content: 'Tu es un assistant sécurité qui répond en Français et Eʋe de manière brève et claire, spécialisé en anti‑phishing. Donne des étapes actionnables.' },
    { role: 'user', content: userText }
  ];
  const apiBase = `http://${window.location.hostname || 'localhost'}:3001`;
  const response = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: 'openai/gpt-4o-mini' }),
    signal: controller.signal
  });
  if (!response.ok) throw new Error('Chat error');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      if (!part.startsWith('data:')) continue;
      const payload = part.replace(/^data:\s*/, '').trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || '';
        if (delta) appendChatbotDelta(delta);
      } catch (_) { /* ignore */ }
    }
  }
}

let currentBotBubble = null;
function appendChatbotDelta(text) {
  if (!currentBotBubble) {
    currentBotBubble = document.createElement('div');
    currentBotBubble.className = 'chatbot-msg bot';
    currentBotBubble.textContent = '';
    const list = document.getElementById('chatbotMessages');
    list.appendChild(currentBotBubble);
    list.scrollTop = list.scrollHeight;
  }
  currentBotBubble.textContent += text;
}

function appendChatbotMessage(text, who = 'bot') {
  const list = document.getElementById('chatbotMessages');
  const div = document.createElement('div');
  div.className = `chatbot-msg ${who}`;
  div.textContent = text;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

function sendChatbotMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatbotText');
  const text = input.value.trim();
  if (!text) return false;
  appendChatbotMessage(text, 'user');
  input.value = '';
  currentBotBubble = null;
  streamChatbotResponse(text).catch(err => {
    appendChatbotMessage('Erreur côté assistant. Réessayez.', 'bot');
    console.error(err);
  });
  return false;
}

function toggleChatbot(forceOpen) {
  const root = document.getElementById('chatbot');
  const toggle = document.getElementById('chatbotToggle');
  const isOpen = forceOpen !== undefined ? forceOpen : !root.classList.contains('open');
  if (isOpen) {
    root.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  } else {
    root.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  return false;
}

// Language switching
function setLanguage(lang) {
  currentLang = I18N[lang] ? lang : 'fr';
  applyI18n();
}

//Close modal on outside click and init
window.addEventListener('load', () => {
    const modal = getElement("fullReportModal");
    window.addEventListener('click', e => e.target === modal && closeModal());

    // i18n init
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = currentLang;
      langSelect.addEventListener('change', e => setLanguage(e.target.value));
    }
    applyI18n();

    // chatbot init
    const toggleBtn = document.getElementById('chatbotToggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => toggleChatbot());
    appendChatbotMessage(currentLang === 'fr'
      ? 'Bonjour! Posez vos questions sur le phishing (FR/Eʋe).'
      : 'Woezɔ! Bia wò biabiawo ɖe phishing me (FR/Eʋe).', 'bot');
});