import { fetchXMLData } from './utils/xml.js';

document.addEventListener('DOMContentLoaded', function () {
    const CONFIG = {
        xmlFeedUrl: 'https://www.arpa.piemonte.it/export/xmlcap/allerta.xml',
        corsProxyUrls: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-anywhere.herokuapp.com/'
        ],
        retryDelay: 5000,
        maxRetries: 3
    };

    const elements = {
        alertHeadline: document.getElementById('alert-headline'),
        alertDescription: document.getElementById('alert-description'),
        alertEvent: document.getElementById('alert-event'),
        alertSeverity: document.getElementById('alert-severity'),
        alertUrgency: document.getElementById('alert-urgency'),
        alertCertainty: document.getElementById('alert-certainty'),
        alertEffective: document.getElementById('alert-effective'),
        alertExpires: document.getElementById('alert-expires'),
        alertAreaDesc: document.getElementById('alert-area-desc'),
        alertSent: document.getElementById('alert-sent'),
        areasContainer: document.getElementById('areas-container')
    };

    const paramList = [
        'sent',
        'info/event',
        'info/severity',
        'info/urgency',
        'info/certainty',
        'info/effective',
        'info/expires',
        'info/headline',
        'info/description',
        'info/area/areaDesc'
    ];

    async function fetchWithRetry(retryCount = 0, proxyIndex = 0) {
        const proxy = CONFIG.corsProxyUrls[proxyIndex];
        const url = proxy + encodeURIComponent(CONFIG.xmlFeedUrl);

        try {
            const res = await fetch(url);
            const xmlText = await res.text();
            const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');

            const alertElements = Array.from(xmlDoc.querySelectorAll("info"));

            if (alertElements.length > 0) {
                // Fetch and process data using fetchXMLData
                const data = await fetchXMLData(url, paramList, 'alert');
                if (data && data.length > 0) updateUI(data[0]);
                generateAreaTables(alertElements);
            } else {
                console.warn('No alert data found.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            tryNextProxy(retryCount, proxyIndex);
        }
    }

    function tryNextProxy(retryCount, currentProxyIndex) {
        if (currentProxyIndex < CONFIG.corsProxyUrls.length - 1) {
            console.log(`Trying next proxy server...`);
            fetchWithRetry(retryCount, currentProxyIndex + 1);
        } else if (retryCount < CONFIG.maxRetries) {
            console.log(`All proxies failed, retrying from first proxy in ${CONFIG.retryDelay}ms...`);
            setTimeout(() => fetchWithRetry(retryCount + 1, 0), CONFIG.retryDelay);
        } else {
            console.error('All proxies failed.');
        }
    }

    function updateUI(data) {
        const set = (el, val) => {
            if (el && val !== undefined) el.textContent = val;
        };

        set(elements.alertHeadline, data['info/headline']);
        set(elements.alertDescription, data['info/description']);
        set(elements.alertEvent, data['info/event']);
        set(elements.alertSeverity, data['info/severity']);
        set(elements.alertUrgency, data['info/urgency']);
        set(elements.alertCertainty, data['info/certainty']);
        set(elements.alertEffective, formatDate(data['info/effective']));
        set(elements.alertExpires, formatDate(data['info/expires']));
        set(elements.alertAreaDesc, data['info/area/areaDesc']);
        set(elements.alertSent, formatDate(data['sent']));

        if (elements.alertSeverity) {
            elements.alertSeverity.className = `alert-badge ${data['info/severity'].toLowerCase()}`;
        }
    }

    function formatDate(dateStr) {
        try {
            return new Date(dateStr).toLocaleString('it-IT');
        } catch {
            return dateStr;
        }
    }

    function generateAreaTables(alertElements) {
        const container = elements.areasContainer;
        container.innerHTML = '';

        alertElements.forEach(alert => {
            const alertEvent = alert.querySelector('event')?.textContent ?? 'Allerta sconosciuta';
            const responseType = alert.querySelector('responseType')?.textContent ?? 'N/A';
            const urgency = alert.querySelector('urgency')?.textContent ?? 'N/A';
            const severity = alert.querySelector('severity')?.textContent ?? 'N/A';
            const certainty = alert.querySelector('certainty')?.textContent ?? 'N/A';
            const areaDesc = alert.querySelector('areaDesc')?.textContent ?? 'Area sconosciuta';
            const onset = alert.querySelector('onset')?.textContent ?? 'N/A';
            const expires = alert.querySelector('expires')?.textContent ?? 'N/A';
            const sent = alert.querySelector('sent')?.textContent ?? 'N/A';
            const parameters = Array.from(alert.querySelectorAll('parameter'));

            console.log(`Generando tabella per l'area: ${areaDesc}`); // Log della generazione della tabella per area

            const data = {}; // Crea un oggetto separato per ogni area

            // Estrarre i parametri per ogni area
            parameters.forEach(param => {
                const name = param.querySelector("valueName")?.textContent;
                const value = param.querySelector("value")?.textContent;

                if (name && value) {
                    const [phenomenon, interval] = name.split("_");

                    if (!data[phenomenon]) data[phenomenon] = {};

                    // Assegna il valore correttamente agli intervalli
                    if (interval === "1224") {
                        data[phenomenon]["1224"] = value;
                    } else if (interval === "2436") {
                        data[phenomenon]["2436"] = value;
                    }
                }
            });

            const tableHTML = `
                <div class="zone-panel">
                    <div class="zone-header" onclick="togglePanel(this)">
                        <h3>${areaDesc}</h3>
                    </div>
                    <div class="zone-body">
                        <div class="operational-details">
                            <div class="info-group">
                                <div class="info-item">
                                    <span class="label">Livello di pericolo:</span>
                                    <span class="alert-badge ${alertEvent.toLowerCase()}">${alertEvent}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Tipo di risposta:</span>
                                    <span class="value">${responseType}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Data di emissione:</span>
                                    <span class="value">${formatDate(sent)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Data di scadenza:</span>
                                    <span class="value">${formatDate(expires)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Data di inizio:</span>
                                    <span class="value">${formatDate(onset)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Urgenza:</span>
                                    <span class="value-badge">${urgency}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Severità:</span>
                                    <span class="alert-badge ${severity.toLowerCase()}">${severity}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Certezza:</span>
                                    <span class="value-badge">${certainty}</span>
                                </div>
                            </div>
                        </div>
                        <div class="alert-types-grid">
                            ${Object.entries(data).map(([phenomenon, values]) => `
                                <div class="alert-type">
                                    <h3><i class="${getPhenomenonIcon(phenomenon)}"></i> ${capitalize(phenomenon.toLowerCase())}</h3>
                                    <div class="day-alerts">
                                        <div class="day-alert">
                                            <span class="day-label">Oggi:</span>
                                            <span class="alert-badge ${(values["1224"] || '').toLowerCase()}">${values["1224"] ?? "-"}</span>
                                        </div>
                                        <div class="day-alert">
                                            <span class="day-label">Domani:</span>
                                            <span class="alert-badge ${(values["2436"] || '').toLowerCase()}">${values["2436"] ?? "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML("beforeend", tableHTML);
        });
    }

    function getPhenomenonIcon(phenomenon) {
        const icons = {
            'IDROGEOLOGICO': 'fas fa-water',
            'IDRAULICO': 'fas fa-house-flood-water',
            'TEMPORALI': 'fas fa-cloud-bolt',
            'NEVE': 'fas fa-snowflake',
            'VALANGHE': 'fas fa-mountain'
        };
        return icons[phenomenon.toUpperCase()] || 'fas fa-exclamation-triangle';
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function togglePanel(header) {
        const panel = header.closest('.zone-panel');
        const body = panel.querySelector('.zone-body');
        if (body) {
            body.classList.toggle('show');
            header.classList.toggle('expanded');
        }
    }

    // Make togglePanel available globally
    window.togglePanel = togglePanel;

    // Initial load
    fetchWithRetry();

    // Refresh every 30 minutes
    setInterval(fetchWithRetry, 30 * 60 * 1000);
});
