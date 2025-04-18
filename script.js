document.addEventListener('DOMContentLoaded', function() {
    console.log("exists('zone-alerts'):", exists('zone-alerts')); // Add this line
    // Helper to check if an element exists
    function exists(id) {
        return document.getElementById(id) !== null;
    }

    // --- DASHBOARD PAGE LOGIC ---
    const CONFIG = {
        refreshInterval: 5 * 60 * 1000,
        xmlFeedUrl: 'https://thingproxy.freeboard.io/fetch/' + encodeURIComponent('https://www.arpa.piemonte.it/export/xmlcap/allerta.xml'),
        isStatic: false
    };

    const elements = {
        alertDetails: document.getElementById('alert-details'),
        emissionDate: document.getElementById('emission-date'),
        generalStatus: document.getElementById('general-status'),
        zoneAlerts: document.getElementById('zone-alerts'),
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        zoneLAlertTypes: document.getElementById('zone-l-alert-types'),
        zoneLAlertDescription: document.getElementById('zone-l-alert-description'),
        onset: document.getElementById('onset'),
        expires: document.getElementById('expires'),
        alertNote: document.getElementById('alert-note')
    };

    const staticData = {
        emissionDate: new Date().toLocaleString('it-IT'),
        generalStatus: 'Allerta rossa per alcune zone',
        zoneAlerts: [
            { zone: 'Zona A (Val Toce, Val Cannobina, Val Formazza)', level: 'rosso', type: 'Idrogeologica' },
            { zone: 'Zona B (Alto Sesia, Cervo)', level: 'arancione', type: 'Idraulica' },
            { zone: 'Zona C (Valli Orco, Lanzo, Sangone)', level: 'giallo', type: 'Idrogeologica' },
            { zone: 'Zona D (Valli Susa, Chisone, Pellice)', level: 'arancione', type: 'Valanghe' },
            { zone: 'Zona E (Valli Po, Varaita, Maira, Stura)', level: 'rosso', type: 'Idrogeologica' },
            { zone: 'Zona F (Valli Gesso, Vermenagna, Pesio)', level: 'giallo', type: 'Idraulica' },
            { zone: 'Zona G (Val Tanaro)', level: 'verde', type: 'Idrogeologica' },
            { zone: 'Zona H (Belbo, Bormida)', level: 'giallo', type: 'Idraulica' },
            { zone: 'Zona I (Scrivia)', level: 'verde', type: 'Idrogeologica' },
            { zone: 'Zona L (Pianura Torinese)', level: 'giallo', type: 'Temporali' },
            { zone: 'Zona M (Pianura Cuneese-Alessandrina)', level: 'arancione', type: 'Temporali' }
        ],
        note: "Questa è una nota di esempio proveniente dal feed ARPA Piemonte.",
        onset: "2025-04-16T11:00:00+00:00",
        expires: "2025-04-17T22:00:00+00:00"
    };

    const ZONE_DETAILS = {
        'Zona A (Val Toce, Val Cannobina, Val Formazza)': {
            description: 'Bacini Toce, Strona, Cannobino',
            population: '75.000',
            provinces: ['Verbano-Cusio-Ossola'],
            mainRisks: ['Alluvioni', 'Valanghe'],
            elevation: '200-4600m'
        },
        'Zona B (Alto Sesia, Cervo)': {
            description: 'Bacini Sesia, Cervo',
            population: '130.000',
            provinces: ['Vercelli', 'Biella'],
            mainRisks: ['Alluvioni', 'Frane'],
            elevation: '200-4500m'
        },
        'Zona C (Valli Orco, Lanzo, Sangone)': {
            description: 'Valli Orco, Lanzo, Sangone',
            population: '110.000',
            provinces: ['Torino'],
            mainRisks: ['Valanghe', 'Frane'],
            elevation: '300-3600m'
        },
        'Zona D (Valli Susa, Chisone, Pellice)': {
            description: 'Valli Susa, Chisone, Pellice',
            population: '120.000',
            provinces: ['Torino'],
            mainRisks: ['Valanghe', 'Alluvioni'],
            elevation: '300-3800m'
        },
        'Zona E (Valli Po, Varaita, Maira, Stura)': {
            description: 'Valli Cuneesi settentrionali',
            population: '90.000',
            provinces: ['Cuneo'],
            mainRisks: ['Valanghe', 'Frane'],
            elevation: '400-3800m'
        },
        'Zona F (Valli Gesso, Vermenagna, Pesio)': {
            description: 'Valli Cuneesi meridionali',
            population: '85.000',
            provinces: ['Cuneo'],
            mainRisks: ['Alluvioni', 'Valanghe'],
            elevation: '400-3200m'
        },
        'Zona G (Val Tanaro)': {
            description: 'Bacino del Tanaro',
            population: '95.000',
            provinces: ['Cuneo'],
            mainRisks: ['Alluvioni', 'Frane'],
            elevation: '300-2600m'
        },
        'Zona H (Belbo, Bormida)': {
            description: 'Bacini Belbo e Bormida',
            population: '140.000',
            provinces: ['Alessandria', 'Asti'],
            mainRisks: ['Alluvioni', 'Siccità'],
            elevation: '100-800m'
        },
        'Zona I (Scrivia)': {
            description: 'Bacino Scrivia',
            population: '110.000',
            provinces: ['Alessandria'],
            mainRisks: ['Alluvioni', 'Frane'],
            elevation: '100-1700m'
        },
        'Zona L (Pianura Torinese)': {
            description: 'Area metropolitana e pianura torinese',
            population: '1.500.000',
            provinces: ['Torino'],
            mainRisks: ['Temporali', 'Allagamenti'],
            elevation: '200-350m'
        },
        'Zona M (Pianura Cuneese-Alessandrina)': {
            description: 'Pianura cuneese e alessandrina',
            population: '450.000',
            provinces: ['Cuneo', 'Alessandria', 'Asti'],
            mainRisks: ['Temporali', 'Siccità'],
            elevation: '100-400m'
        }
    };

    const STATIC_WEATHER = {
        'Zona A (Val Toce, Val Cannobina, Val Formazza)': {
            temperature: 15.8,
            humidity: 75,
            pressure: 1009,
            precipitation: 1.0,
            feels_like: 15.2,
            dew_point: 14.0,
            rain_probability: 60,
            rain_24h: 5.5,
            wind_speed: 22,
            wind_direction: 200,
            wind_gust: 35,
            visibility: 4,
            cloud_cover: 80,
            uv_index: 2
        },
        'Zona B (Alto Sesia, Cervo)': {
            temperature: 17.5,
            humidity: 70,
            pressure: 1011,
            precipitation: 0.8,
            feels_like: 17.0,
            dew_point: 13.5,
            rain_probability: 45,
            rain_24h: 3.2,
            wind_speed: 18,
            wind_direction: 190,
            wind_gust: 28,
            visibility: 6,
            cloud_cover: 65,
            uv_index: 3
        },
        // Add entries for all zones with appropriate weather data
        // ...existing entries for other zones...
    };

    const ZONE_MAPPING = {
        'Piem-A': 'Zona A (Val Toce, Val Cannobina, Val Formazza)',
        'Piem-B': 'Zona B (Alto Sesia, Cervo)',
        'Piem-C': 'Zona C (Valli Orco, Lanzo, Sangone)',
        'Piem-D': 'Zona D (Valli Susa, Chisone, Pellice)',
        'Piem-E': 'Zona E (Valli Po, Varaita, Maira, Stura)',
        'Piem-F': 'Zona F (Valli Gesso, Vermenagna, Pesio)',
        'Piem-G': 'Zona G (Val Tanaro)',
        'Piem-H': 'Zona H (Belbo, Bormida)',
        'Piem-I': 'Zona I (Scrivia)',
        'Piem-L': 'Zona L (Pianura Torinese)',
        'Piem-M': 'Zona M (Pianura Cuneese-Alessandrina)'
    };

    function getAlertLevelDescription(level) {
        const descriptions = {
            'verde': 'Condizioni ordinarie: fenomeni naturali che non prevedono danni.',
            'giallo': 'Potenziali pericoli: possibili danni localizzati.',
            'arancione': 'Pericoli diffusi: probabili danni estesi.',
            'rosso': 'Pericoli gravi: danni diffusi e ingenti.'
        };
        return descriptions[level.toLowerCase()] || '';
    }

    function updateUI(data) {
        if (!data) return;

        console.log("Data in updateUI:", data); // Add this line

        elements.emissionDate.textContent = data.emissionDate;
        elements.generalStatus.textContent = data.generalStatus;

        if (exists('zone-alerts')) {
            // Dashboard logic (multi-zone)
            elements.zoneAlerts.innerHTML = '';

            data.zoneAlerts.forEach(alert => {
                console.log("Alert:", alert); // Add this line

                const zoneKey = alert.zone;
                const zoneInfo = ZONE_DETAILS[zoneKey];

                if (!zoneInfo) {
                    console.warn(`Missing zone info for ${zoneKey}`);
                    return;
                }

                const listItem = document.createElement('div');
                listItem.classList.add('alert-item');

                let alertDetailsHTML = '';
                for (const type in alert.alertTypes) {
                    const level = alert.alertTypes[type];
                    listItem.classList.add(`alert-level-${level.toLowerCase()}`);
                    let iconClass = '';
                    switch (type) {
                        case 'IDROGEOLOGICO':
                            iconClass = 'fas fa-mountain';
                            break;
                        case 'IDRAULICO':
                            iconClass = 'fas fa-water';
                            break;
                        case 'TEMPORALI':
                            iconClass = 'fas fa-bolt';
                            break;
                        case 'NEVE':
                            iconClass = 'fas fa-snowflake';
                            break;
                        case 'VALANGHE':
                            iconClass = 'fas fa-skiing';
                            break;
                        default:
                            iconClass = 'fas fa-exclamation-circle';
                    }
                    alertDetailsHTML += `
                        <p class="alert-status">
                            <i class="${iconClass}"></i>
                            <strong style="color: black;">${type}:</strong> <span class="alert-level ${level}">${level.toUpperCase()}</span>
                        </p>
                    `;
                }

                listItem.innerHTML = `
                    <div class="alert-header" onclick="this.parentElement.querySelector('.alert-content').classList.toggle('collapsed')">
                        <h3>${zoneKey}</h3>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="alert-content collapsed">
                        <div class="alert-details">
                            ${alertDetailsHTML}
                            <p class="alert-description">${zoneInfo.description}</p>
                            <div class="zone-info">
                                <p><i class="fas fa-users"></i> <strong>Popolazione:</strong> ${zoneInfo.population}</p>
                                <p><i class="fas fa-city"></i> <strong>Province:</strong> ${zoneInfo.provinces.join(', ')}</p>
                                <p><i class="fas fa-exclamation-triangle"></i> <strong>Rischi principali:</strong> ${zoneInfo.mainRisks.join(', ')}</p>
                                <p><i class="fas fa-mountain"></i> <strong>Altitudine:</strong> ${zoneInfo.elevation}</p>
                                </div>
                            </div>
                        </div>
                    `;

                elements.zoneAlerts.appendChild(listItem);
            });

            updateSituationSummary(data.zoneAlerts, data);
        }

        // Index logic (single-zone: Zona L)
        if (exists('zone-l-alert-types')) {
            const zonaLAlert = data.zoneAlerts.find(alert => alert.zone === 'Zona L (Pianura Torinese)');

            if (zonaLAlert && elements.zoneLAlertTypes) {
                elements.zoneLAlertTypes.innerHTML = ''; // Clear previous content

                for (const type in zonaLAlert.alertTypes) {
                    const level = zonaLAlert.alertTypes[type];
                    const alertTypeElement = document.createElement('p');
                    alertTypeElement.classList.add('alert-status');
                    let iconClass = '';
                    switch (type) {
                        case 'IDROGEOLOGICO':
                            iconClass = 'fas fa-mountain';
                            break;
                        case 'IDRAULICO':
                            iconClass = 'fas fa-water';
                            break;
                        case 'TEMPORALI':
                            iconClass = 'fas fa-bolt';
                            break;
                        case 'NEVE':
                            iconClass = 'fas fa-snowflake';
                            break;
                        case 'VALANGHE':
                            iconClass = 'fas fa-skiing';
                            break;
                        default:
                            iconClass = 'fas fa-exclamation-circle';
                    }
                    alertTypeElement.innerHTML = `
                        <i class="${iconClass}"></i>
                        <strong style="color: black;">${type}:</strong> <span class="alert-level ${level}">${level.toUpperCase()}</span>
                    `;
                    elements.zoneLAlertTypes.appendChild(alertTypeElement);
                }

                const highestLevel = Object.values(zonaLAlert.alertTypes).reduce((highest, level) => {
                    const alertLevels = ['verde', 'giallo', 'arancione', 'rosso'];
                    return alertLevels.indexOf(level) > alertLevels.indexOf(highest) ? level : highest;
                }, 'verde');

                elements.zoneLAlertDescription.textContent = getAlertLevelDescription(highestLevel);
                elements.generalStatus.textContent = getAlertLevelDescription(highestLevel);
            }
        }

        if (elements.onset && data.onset) {
            const d = new Date(data.onset);
            elements.onset.textContent = isNaN(d) ? data.onset : d.toLocaleString('it-IT');
        }
        if (elements.expires && data.expires) {
            const d = new Date(data.expires);
            elements.expires.textContent = isNaN(d) ? data.onset : d.toLocaleString('it-IT');
        }
        if (elements.alertNote && data.note) {
            elements.alertNote.innerHTML = `<i class="fas fa-sticky-note"></i> <strong>Nota:</strong> ${data.note}`;
        }
    }

    function showLoading(show = true) {
        elements.loading.classList.toggle('hidden', !show);
        if (exists('zone-alerts')) {
            elements.alertDetails.classList.toggle('hidden', show);
        }
        elements.error.classList.toggle('hidden', true);
    }

    function showError(show = true) {
        elements.error.classList.toggle('hidden', !show);
        elements.loading.classList.toggle('hidden', true);
        if (exists('zone-alerts')) {
            elements.alertDetails.classList.toggle('hidden', true);
        }
    }

    function parseZoneAlertsFromXML(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const alerts = Array.from(xmlDoc.querySelectorAll('*|alert'));  // Use namespace

        console.log("Alerts:", alerts); // Add this line

        return alerts.flatMap(alert => {
            const infos = Array.from(alert.querySelectorAll('info'));
            console.log("Infos:", infos); // Add this line

            return infos.map(info => {
                const xmlZoneCode = info.querySelector('area areaDesc')?.textContent || 'Unknown Zone'; // Get the XML zone code
                const areaDesc = ZONE_MAPPING[xmlZoneCode] || 'Unknown Zone'; // Map to dashboard zone name
                console.log("areaDesc:", areaDesc); // Add this line
                const event = info.querySelector('event')?.textContent || 'undefined';
                console.log("event:", event); // Add this line

                // Extract all alert types and levels from parameters
                const alertTypes = {};

                const parameters = Array.from(info.querySelectorAll('parameter'));
                console.log("parameters:", parameters); // Add this line

                parameters.forEach(parameter => {
                    const valueName = parameter.querySelector('valueName')?.textContent;
                    console.log("valueName:", valueName); // Add this line
                    const value = parameter.querySelector('value')?.textContent;
                    console.log("value:", value); // Add this line

                    if (valueName && value) {
                        if (valueName.startsWith('IDRAULICO') || valueName.startsWith('IDROGEOLOGICO') || valueName.startsWith('TEMPORALI') || valueName.startsWith('NEVE') || valueName.startsWith('VALANGHE')) {
                            const type = valueName.split('_')[0];
                            const level = value.toLowerCase();
                            alertTypes[type] = level;
                        }
                    }
                });

                const zone = areaDesc;

                console.log("Zone:", zone);
                console.log("Alert Types:", alertTypes);

                return { zone, alertTypes };
            });
        });
    }

    async function fetchAlertData() {
        console.log("fetchAlertData called!");  // Add this line
        showLoading();
        try {
            if (CONFIG.isStatic) {
                await new Promise(resolve => setTimeout(resolve, 500));
                showLoading(false);
                updateUI(staticData);
            } else {
                fetch(CONFIG.xmlFeedUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(xmlText => {
                        console.log("XML Text:", xmlText);
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                        console.log("XML Doc:", xmlDoc);

                        const parsedAlerts = parseZoneAlertsFromXML(xmlText);
                        console.log("Zone Alerts:", parsedAlerts); // Add this line

                        const onsetNode = xmlDoc.querySelector('onset');
                        const expiresNode = xmlDoc.querySelector('expires'); // Declare expiresNode here

                        let onsetText = onsetNode ? onsetNode.textContent.trim() : "";
                        let expiresText = expiresNode ? expiresNode.textContent.trim() : "";

                        // Handle empty date strings
                        if (!onsetText || onsetText.trim() === "") {
                            onsetText = null;
                        } else {
                            // Preprocess the date strings to handle potential timezone issues
                            onsetText = onsetText.replace(' ', 'T') + '+00:00';
                            onsetText = onsetText.replace('+00:00+00:00', '+00:00'); // Remove extra +00:00
                        }

                        if (!expiresText || expiresText.trim() === "") {
                            expiresText = null;
                        } else {
                            // Preprocess the date strings to handle potential timezone issues
                            expiresText = expiresText.replace(' ', 'T') + '+00:00';
                            expiresText = expiresText.replace('+00:00+00:00', '+00:00'); // Remove extra +00:00
                        }

                        const onsetDate = onsetText ? new Date(onsetText) : null;
                        const expiresDate = expiresText ? new Date(expiresText) : null;

                        if (onsetDate && isNaN(onsetDate)) {
                            console.error('Invalid onset date:', onsetText);
                            onsetText = null; // Set to null if invalid
                        }

                        if (expiresDate && isNaN(expiresDate)) {
                            console.error('Invalid expires date:', expiresText);
                            expiresText = null; // Set to null if invalid
                        }

                        const noteNode = xmlDoc.querySelector('note');
                        const noteText = noteNode ? noteNode.textContent.trim() : "";

                        if (parsedAlerts) {
                            const data = {
                                ...staticData,
                                zoneAlerts: parsedAlerts,
                                emissionDate: new Date().toLocaleString('it-IT'),
                                note: noteText,
                                onset: onsetText,
                                expires: expiresText
                            };
                            showLoading(false);
                            updateUI(data);
                            updateSituationSummary(parsedAlerts, data); // Pass data object
                        } else {
                            throw new Error('Failed to parse zone alerts from XML');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        console.error('Error details:', error.message, error.stack); // Add these lines
                        showError(true);
                    });
            }
        } catch (error) {
            console.error('Errore nel caricamento dei dati:', error);
            showError();
        }
    }

    // Initialize
    fetchAlertData();
    if (CONFIG.refreshInterval > 0) {
        setInterval(fetchAlertData, CONFIG.refreshInterval);
    }
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
}

document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('legendModal');
    if (modal && event.key === 'Escape' && modal.style.display === 'block') {
        toggleLegendModal();
    }
});

function updateSituationSummary(alerts, data) { // Receive data object
    const alertLevels = ['verde', 'giallo', 'arancione', 'rosso'];
    const highestLevel = alerts.reduce((highest, alert) => {
        // Check if alert.level exists before calling toLowerCase()
        if (alert.alertTypes && Object.keys(alert.alertTypes).length > 0) {
            let maxLevel = 'verde';
            for (const type in alert.alertTypes) {
                const level = alert.alertTypes[type];
                const currentIndex = alertLevels.indexOf(level.toLowerCase());
                const highestIndex = alertLevels.indexOf(maxLevel);
                if (currentIndex > highestIndex) {
                    maxLevel = level;
                }
            }
            const highestIndex = alertLevels.indexOf(highest);
            return alertLevels.indexOf(maxLevel.toLowerCase()) > highestIndex ? maxLevel : highest;
        } else {
            return highest;
        }
    }, 'verde');

    const sectionHeader = document.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.className = 'section-header';
        sectionHeader.classList.add(`level-${highestLevel}`);
    }

    const situationText = document.getElementById('situation-text');
    if (situationText) {
        const alertCount = alerts.filter(alert => alert.alertTypes && Object.keys(alert.alertTypes).length > 0).length;

        //situationText.textContent = alertCount === 0
        //    ? 'Nessuna allerta in corso'
        //    : `${alertCount} zone in allerta - Livello massimo: ${highestLevel.toUpperCase()}`;
        situationText.innerHTML = `<i class="fas fa-sticky-note"></i> <strong>Nota:</strong> <em>${data.note}</em>`;
    }
}
