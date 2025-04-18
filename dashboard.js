document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        xmlFeedUrl: 'https://www.arpa.piemonte.it/export/xmlcap/allerta.xml',
        corsProxyUrl: 'https://cors-anywhere.herokuapp.com/'
    };

    const elements = {
        emissionDate: document.getElementById('emission-date'),
        generalStatus: document.getElementById('general-status'),
        onset: document.getElementById('onset'),
        expires: document.getElementById('expires'),
        situationText: document.getElementById('situation-text'),
        zonePanels: document.getElementById('zone-panels'),
        loading: document.getElementById('loading'),
        error: document.getElementById('error')
    };

    const ZONE_DESCRIPTIONS = {
        'Zona A': {
            name: 'Alto Novarese e VCO',
            description: 'Comprende il settore settentrionale del Piemonte, includendo la Val d\'Ossola, il Verbano, il Cusio e l\'alto novarese.',
            provinces: 'Verbano-Cusio-Ossola, Novara (parte settentrionale)',
            characteristics: 'Area alpina e prealpina con presenza di grandi laghi.'
        },
        'Zona B': {
            name: 'Pianura Settentrionale',
            description: 'Include la pianura novarese, biellese e vercellese.',
            provinces: 'Novara (pianura), Vercelli, Biella',
            characteristics: 'Area pianeggiante con presenza di risaie e reticolo idrografico complesso.'
        },
        'Zona C': {
            name: 'Valli Torinesi',
            description: 'Comprende le valli alpine del torinese.',
            provinces: 'Torino (settore alpino)',
            characteristics: 'Area prevalentemente montuosa con valli alpine profonde.'
        },
        'Zona D': {
            name: 'Pianura Torinese e Colline',
            description: 'Include l\'area metropolitana di Torino e le colline circostanti.',
            provinces: 'Torino (pianura e collina)',
            characteristics: 'Area urbanizzata con presenza di colline e pianura.'
        },
        'Zona E': {
            name: 'Cuneese Montano',
            description: 'Comprende il settore alpino della provincia di Cuneo.',
            provinces: 'Cuneo (settore alpino)',
            characteristics: 'Area montana con presenza di importanti massicci alpini.'
        },
        'Zona F': {
            name: 'Pianura Cuneese',
            description: 'Include la pianura della provincia di Cuneo.',
            provinces: 'Cuneo (pianura)',
            characteristics: 'Area pianeggiante con presenza di importanti corsi d\'acqua.'
        },
        'Zona G': {
            name: 'Astigiano',
            description: 'Comprende il territorio della provincia di Asti.',
            provinces: 'Asti',
            characteristics: 'Area collinare con caratteristiche vitivinicole.'
        },
        'Zona H': {
            name: 'Torinese Collinare',
            description: 'Include l\'area collinare del torinese.',
            provinces: 'Torino (settore collinare)',
            characteristics: 'Area prevalentemente collinare.'
        },
        'Zona I': {
            name: 'Alessandrino Settentrionale',
            description: 'Comprende il settore settentrionale della provincia di Alessandria.',
            provinces: 'Alessandria (nord)',
            characteristics: 'Area collinare e di pianura con presenza di importanti corsi d\'acqua.'
        },
        'Zona L': {
            name: 'Alessandrino Appenninico',
            description: 'Include il settore appenninico della provincia di Alessandria.',
            provinces: 'Alessandria (sud)',
            characteristics: 'Area appenninica con caratteristiche orografiche complesse.'
        },
        'Zona M': {
            name: 'Belbo e Bormida',
            description: 'Comprende i bacini dei fiumi Belbo e Bormida.',
            provinces: 'Alessandria, Asti (bacini Belbo e Bormida)',
            characteristics: 'Area con presenza di importanti bacini fluviali.'
        }
    };

    function formatZoneName(name) {
        return name.replace(/Piem-([A-Z])/g, 'Zona $1');
    }

    async function fetchDashboardData() {
        showLoading(true);
        try {
            const url = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
                ? CONFIG.corsProxyUrl + CONFIG.xmlFeedUrl
                : CONFIG.xmlFeedUrl;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "application/xml");

            // Update header information
            elements.emissionDate.textContent = xml.querySelector('sent')?.textContent || '';
            elements.generalStatus.textContent = xml.querySelector('info > headline')?.textContent || '';
            elements.onset.textContent = xml.querySelector('info > onset')?.textContent || '';
            elements.expires.textContent = xml.querySelector('info > expires')?.textContent || '';

            // After parsing the XML, create a summary of alerts
            const areas = xml.querySelectorAll('area');
            const alertSummary = {};
            let maxAlertLevel = 'Verde';

            // Process all areas to build summary
            areas.forEach(area => {
                const zoneName = formatZoneName(area.querySelector('areaDesc')?.textContent || '');
                const alertLevel = area.querySelector('parameter[valueName="alert_level"] value')?.textContent || 'Verde';

                if (!alertSummary[alertLevel]) {
                    alertSummary[alertLevel] = [];
                }
                alertSummary[alertLevel].push(zoneName);

                // Update max alert level
                const alertOrder = { 'Verde': 0, 'Giallo': 1, 'Arancione': 2, 'Rosso': 3 };
                if (alertOrder[alertLevel] > alertOrder[maxAlertLevel]) {
                    maxAlertLevel = alertLevel;
                }
            });

            // Create summary text
            let summaryText = `<strong>Livello massimo di allerta: <span class="alert-level ${maxAlertLevel.toLowerCase()}">${maxAlertLevel}</span></strong><br><br>`;
            
            const alertLevels = ['Rosso', 'Arancione', 'Giallo', 'Verde'];
            alertLevels.forEach(level => {
                if (alertSummary[level] && alertSummary[level].length > 0) {
                    summaryText += `<div class="summary-level">
                        <span class="alert-level ${level.toLowerCase()}">${level}</span>: 
                        ${alertSummary[level].join(', ')}
                    </div>`;
                }
            });

            // Update the situation text
            elements.situationText.innerHTML = summaryText;

            // Create zone panels
            elements.zonePanels.innerHTML = '';
            areas.forEach(area => {
                const rawZoneName = area.querySelector('areaDesc')?.textContent || '';
                const zoneName = formatZoneName(rawZoneName); // Format the zone name
                const alertLevel = area.querySelector('parameter[valueName="alert_level"] value')?.textContent || 'Verde';
                const geocodeValue = area.querySelector('geocode > value')?.textContent || 'N/A';

                // Create panel elements
                const zonePanel = document.createElement('div');
                zonePanel.classList.add('zone-panel');

                const zoneHeader = document.createElement('div');
                zoneHeader.classList.add('zone-header');
                zoneHeader.innerHTML = `
                    <strong>${zoneName}</strong>
                    <span class="alert-level ${alertLevel.toLowerCase()}">${alertLevel}</span>
                `;
                zoneHeader.addEventListener('click', () => togglePanel(zoneHeader));
                zonePanel.appendChild(zoneHeader);

                const zoneBody = document.createElement('div');
                zoneBody.classList.add('zone-body');

                // Get all parameters for this area
                const parameters = area.getElementsByTagName('parameter');
                const alerts = {};
                
                Array.from(parameters).forEach(param => {
                    const valueNameEl = param.querySelector('valueName');
                    const valueEl = param.querySelector('value');
                    
                    if (valueNameEl && valueEl) {
                        const name = valueNameEl.textContent;
                        const value = valueEl.textContent;
                        
                        // Debug output
                        console.log(`Parameter: ${name}, Value: ${value}`);

                        if (name.includes('_day_0') || name.includes('_day_1')) {
                            const type = name.split('_day_')[0];  // Get the type (e.g., 'idrogeologico')
                            const day = name.includes('_day_0') ? 'day0' : 'day1';
                            
                            if (!alerts[type]) {
                                alerts[type] = {};
                            }
                            alerts[type][day] = value;
                        }
                    }
                });

                const zoneInfo = ZONE_DESCRIPTIONS[zoneName] || {
                    name: zoneName,
                    description: 'Informazioni non disponibili',
                    provinces: 'N/A',
                    characteristics: 'N/A'
                };

                let alertDetailsHTML = `
                    <div class="zone-info">
                        <h3>${zoneInfo.name}</h3>
                        <p><strong>Descrizione:</strong> ${zoneInfo.description}</p>
                        <p><strong>Province:</strong> ${zoneInfo.provinces}</p>
                        <p><strong>Caratteristiche:</strong> ${zoneInfo.characteristics}</p>
                    </div>
                    <hr>
                    <div class="alert-details">
                        <p><strong>Livello Allerta:</strong> <span class="alert-level ${alertLevel.toLowerCase()}">${alertLevel}</span></p>
                        <p><strong>Codice Area:</strong> ${geocodeValue}</p>
                    </div>
                    <div class="alert-types">
                        <h4>Tipi di Allerta:</h4>
                        <table class="alert-table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Oggi</th>
                                    <th>Domani</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                // Add rows for each alert type
                const alertTypes = {
                    idrogeologico: 'Idrogeologico',
                    hydrogeological: 'Idrogeologico',  // Alternative name
                    idraulico: 'Idraulico',
                    hydraulic: 'Idraulico',  // Alternative name
                    temporali: 'Temporali',
                    thunderstorms: 'Temporali',  // Alternative name
                    neve: 'Neve',
                    snow: 'Neve',  // Alternative name
                    valanghe: 'Valanghe',
                    avalanche: 'Valanghe'  // Alternative name
                };

                const processedTypes = new Set();
                Object.entries(alertTypes).forEach(([key, label]) => {
                    // Skip if we've already processed this alert type
                    if (processedTypes.has(label)) return;
                    processedTypes.add(label);

                    // Find the first matching key that has data
                    const matchingKey = Object.keys(alerts).find(alertKey => 
                        alertTypes[alertKey] === label
                    ) || key;

                    const today = alerts[matchingKey]?.day0 || 'Verde';
                    const tomorrow = alerts[matchingKey]?.day1 || 'Verde';

                    alertDetailsHTML += `
                        <tr>
                            <td>${label}</td>
                            <td><span class="alert-level ${today.toLowerCase()}">${today}</span></td>
                            <td><span class="alert-level ${tomorrow.toLowerCase()}">${tomorrow}</span></td>
                        </tr>
                    `;
                });

                alertDetailsHTML += `
                            </tbody>
                        </table>
                    </div>
                `;

                zoneBody.innerHTML = alertDetailsHTML;
                zonePanel.appendChild(zoneBody);
                elements.zonePanels.appendChild(zonePanel);
            });

            showLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showError(true);
        }
    }

    function showLoading(show) {
        if (elements.loading) elements.loading.classList.toggle('hidden', !show);
    }
    function showError(show) {
        if (elements.error) elements.error.classList.toggle('hidden', !show);
    }

    // Function to toggle the visibility of the zone body
    function togglePanel(header) {
        const panel = header.parentNode;
        const body = panel.querySelector('.zone-body');
        body.classList.toggle('show');
    }

    fetchDashboardData();
});