// L'api de virus Total
const API_KEY = "f9ad386ec18ff661a32903cd2aa49c52752ed7625257bf15d8f4873bdace4cf7";

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
    if (!url) return showError("Please enter a URL!");

    try{
        new URL(url);//Valid URL format
    }catch{
        return showError("Please enter a valid URL (e.g., https://example.com)");
    }
    
    try{
        showLoading("Submitting URL for scanning ...")

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

    showLoading("Getting scan results...");
    await pollAnalysisResults(submitResult.data.id);
    }catch (error){
        showError(`Error: ${error.message}`);
    }    
}

//Handle le processus de scanning des fichiers
async function scanFile() {
    const file = getElement('fileInput').files[0];
    if(!file) return showError("Please select a file!");
    if (file.size > 32*1024*1024) return showError("La taille ne doit pas depasser 32MB");

    try{
        showLoading("Updating file...");

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

        showLoading("Getting scan results...");
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
           showLoading(`Analyzing ${fileName ? fileName : 'URL'}... (${((maxAttempts - attempts) * interval / 1000).toFixed(0)}s remaining)`);

            const report = await makeRequest(`https://www.virustotal.com/api/v3/analyses/${analysisId}`);
            const status = report.data?.attributes?.status;

            if(!status) throw new Error("Invalid analysis response!");

            if(status === "completed"){
                showFormattedResult(report);
                break;
            }

             if(status === "failed"){
                throw new Error("Analysis failed");
            }

            if(++attempts >= maxAttempts){
                throw new Error("Analysis timeout - please try again!");
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
    if (!data?.data?.attributes?.stats) return showError("Invalid response format");

    const stats = data.data.attributes.stats;
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    if (!total) return showError("No analysis results available!");

    const getPercent = val => ((val / total) * 100).toFixed(1);

    const categories = {
        malicious: { color: 'malicious', label: 'Malicious' },
        suspicious: { color: 'suspicious', label: 'Suspicious' },
        harmless: { color: 'safe', label: 'Clean' },
        undetected: { color: 'undetected', label: 'Undetected' }
    };

    // Correction: utilisation de 'key' au lieu de 'keys'
    const percents = Object.keys(categories).reduce((acc, key) => {
        acc[key] = getPercent(stats[key]);
        return acc;
    }, {});

    const verdict = stats.malicious > 0 ? "Malicious" : 
                   stats.suspicious > 0 ? "Suspicious" : "Safe";
                   
    const verdictClass = stats.malicious > 0 ? "malicious" : 
                        stats.suspicious > 0 ? "suspicious" : "safe";

    updateResult(`
        <h3>Scan Report</h3>
        <div class="scan-stats">
            <p><strong>Verdict:</strong> <span class="${verdictClass}">${verdict}</span></p>
            <div class="progres-section">
                <div class="progress-label">
                    <span>Detection Result</span>
                    <span class="progress-percent">${percents.malicious}% Detection Rate</span>
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
            <button onclick="showFullReport(this.getAttribute('data-report'))" data-report='${JSON.stringify(data)}'>View Full Report</button>
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
        <h3>Full Report details </h3>
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
        ` : '<p>No detailed results available!</p>'}
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

//Close modal on outside click
window.addEventListener('load', () => {
    const modal = getElement("fullReportModal");
    window.addEventListener('click', e => e.target === modal && closeModal());
});