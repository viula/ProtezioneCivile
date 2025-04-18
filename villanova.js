document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        jsonFeedUrl: 'https://www.arpa.piemonte.it/rischi_naturali/widget/comuni/005118/index.json',
        corsProxyUrls: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-anywhere.herokuapp.com/'
        ],
        retryDelay: 5000,
        maxRetries: 3
    };

    const elements = {
        currentAlertLevel: document.getElementById('current-alert-level'),
        emissionDate: document.getElementById('emission-date'),
        expires: document.getElementById('expires'),
        idroToday: document.getElementById('idro-today'),
        idroTomorrow: document.getElementById('idro-tomorrow'),
        idrauToday: document.getElementById('idrau-today'),
        idrauTomorrow: document.getElementById('idrau-tomorrow'),
        tempToday: document.getElementById('temp-today'),
        tempTomorrow: document.getElementById('temp-tomorrow'),
        snowToday: document.getElementById('snow-today'),
        snowTomorrow: document.getElementById('snow-tomorrow'),
        validityDate: document.getElementById('validity-date'),
        extensionDate: document.getElementById('extension-date'),
        endDate: document.getElementById('end-date'),
        zoneName: document.getElementById('zone-name'),
        zoneCode: document.getElementById('zone-code'),
        zoneType: document.getElementById('zone-type'),
        bulletinNumber: document.getElementById('bulletin-number'),
        dangerLevel: document.getElementById('danger-level'),
        dangerUpdate: document.getElementById('danger-update'),
        operationalPhase: document.getElementById('operational-phase'),
        phaseUpdate: document.getElementById('phase-update')
    };

    const staticData = {
        allerta: "VERDE",
        emesso_il: new Date().toISOString(),
        prossimo_aggiornamento: new Date(Date.now() + 24*60*60*1000).toISOString(),
        idrogeologico_day_0: "VERDE",
        idrogeologico_day_1: "VERDE",
        idraulico_day_0: "VERDE",
        idraulico_day_1: "VERDE",
        temporali_day_0: "VERDE",
        temporali_day_1: "VERDE",
        neve_day_0: "VERDE",
        neve_day_1: "VERDE",
        aggiornamento_livello_di_pericolo_attuale: "2025-04-18T16:15:23+0200",
        pericolo_attuale: "ARANCIONE",
        aggiornamento_fase_operativa_comunale_attuata: "2025-04-18T15:30:12+0200",
        fase_operativa_comunale_attuata: "Nessuna Fase Operativa",
        numero_bollettino: "111/2025"
    };

    function createXHR() {
        return new XMLHttpRequest();
    }

    async function fetchData(retryCount = 0, proxyIndex = 0) {
        const xhr = createXHR();
        const proxyUrl = CONFIG.corsProxyUrls[proxyIndex] + encodeURIComponent(CONFIG.jsonFeedUrl);

        xhr.open('GET', proxyUrl, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    updateUI(data);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    tryNextProxy(retryCount, proxyIndex);
                }
            } else if (xhr.status === 429 && retryCount < CONFIG.maxRetries) {
                console.log(`Rate limited, retrying in ${CONFIG.retryDelay}ms...`);
                setTimeout(() => fetchData(retryCount + 1, proxyIndex), CONFIG.retryDelay);
            } else {
                tryNextProxy(retryCount, proxyIndex);
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
            tryNextProxy(retryCount, proxyIndex);
        };

        xhr.send();
    }

    function tryNextProxy(retryCount, currentProxyIndex) {
        if (currentProxyIndex < CONFIG.corsProxyUrls.length - 1) {
            console.log(`Trying next proxy server...`);
            fetchData(retryCount, currentProxyIndex + 1);
        } else if (retryCount < CONFIG.maxRetries) {
            console.log(`All proxies failed, retrying from first proxy in ${CONFIG.retryDelay}ms...`);
            setTimeout(() => fetchData(retryCount + 1, 0), CONFIG.retryDelay);
        } else {
            console.error('All proxies failed, using static data');
            updateUI(staticData);
        }
    }

    function updateUI(data) {
        if (!data) return;

        const formatDate = (dateStr) => {
            try {
                return new Date(dateStr).toLocaleString('it-IT');
            } catch (e) {
                return dateStr;
            }
        };

        const safeUpdateElement = (element, value) => {
            if (element) {
                element.textContent = value;
                if (value.toLowerCase) {
                    element.className = `alert-badge ${value.toLowerCase()}`;
                }
            }
        };

        safeUpdateElement(elements.emissionDate, formatDate(data.emesso_il));
        safeUpdateElement(elements.expires, formatDate(data.prossimo_aggiornamento));
        safeUpdateElement(elements.currentAlertLevel, data.allerta);
        safeUpdateElement(elements.idroToday, data.idrogeologico_day_0);
        safeUpdateElement(elements.idroTomorrow, data.idrogeologico_day_1);
        safeUpdateElement(elements.idrauToday, data.idraulico_day_0);
        safeUpdateElement(elements.idrauTomorrow, data.idraulico_day_1);
        safeUpdateElement(elements.tempToday, data.temporali_day_0);
        safeUpdateElement(elements.tempTomorrow, data.temporali_day_1);
        safeUpdateElement(elements.snowToday, data.neve_day_0);
        safeUpdateElement(elements.snowTomorrow, data.neve_day_1);
        safeUpdateElement(elements.validityDate, formatDate(data.data_validita));
        safeUpdateElement(elements.extensionDate, formatDate(data.data_estensione));
        safeUpdateElement(elements.endDate, formatDate(data.data_fine));
        safeUpdateElement(elements.zoneName, data.nome_zone || 'Zona L');
        safeUpdateElement(elements.zoneCode, data.codice_zone || 'L');
        safeUpdateElement(elements.zoneType, data.tipo_zone || 'Alessandrino Appenninico');

        // Update new operational information
        safeUpdateElement(elements.bulletinNumber, data.numero_bollettino);
        safeUpdateElement(elements.dangerLevel, data.pericolo_attuale);
        safeUpdateElement(elements.dangerUpdate, formatDate(data.aggiornamento_livello_di_pericolo_attuale));
        safeUpdateElement(elements.operationalPhase, data.fase_operativa_comunale_attuata);
        safeUpdateElement(elements.phaseUpdate, formatDate(data.aggiornamento_fase_operativa_comunale_attuata));

        // Add specific class for operational phase
        if (elements.operationalPhase) {
            const phase = data.fase_operativa_comunale_attuata.toLowerCase().replace(/\s+/g, '-');
            elements.operationalPhase.className = `phase-badge ${phase}`;
        }
    }

    // Initial fetch
    fetchData();

    // Refresh every 30 minutes
    setInterval(fetchData, 30 * 60 * 1000);
});

// Legend modal logic (remains global)
function toggleLegendModal() {
    const modal = document.getElementById('legendModal');
    if (!modal) return;
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('legendModal');
    if (modal && event.target === modal) {
        toggleLegendModal();
    }
};

document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('legendModal');
    if (modal && event.key === 'Escape' && modal.style.display === 'block') {
        toggleLegendModal();
    }
});

function updateSituationSummary(alerts, data) {
    // Implementation for updating a situation summary, if needed
}
