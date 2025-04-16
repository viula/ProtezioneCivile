document.addEventListener('DOMContentLoaded', function() {
    // Helper to check if an element exists
    function exists(id) {
        return document.getElementById(id) !== null;
    }

    // --- DASHBOARD PAGE LOGIC ---
    if (exists('zone-alerts')) {
        // Dashboard logic (multi-zone)
        const CONFIG = {
            refreshInterval: 5 * 60 * 1000,
            xmlFeedUrl: 'https://www.arpa.piemonte.it/export/xmlcap/allerta.xml',
            isStatic: true
        };

        const elements = {
            alertDetails: document.getElementById('alert-details'),
            emissionDate: document.getElementById('emission-date'),
            generalStatus: document.getElementById('general-status'),
            zoneAlerts: document.getElementById('zone-alerts'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error')
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

        function getAlertLevelDescription(level) {
            const descriptions = {
                'verde': 'Condizioni ordinarie: fenomeni naturali che non prevedono danni.',
                'giallo': 'Potenziali pericoli: possibili danni localizzati.',
                'arancione': 'Pericoli diffusi: probabili danni estesi.',
                'rosso': 'Pericoli gravi: danni diffusi e ingenti.'
            };
            return descriptions[level.toLowerCase()] || '';
        }

        function renderWeatherInfo(weather) {
            return `
                <div class="weather-info">
                    <h4><i class="fas fa-cloud-sun"></i> Condizioni Meteo</h4>
                    <div class="weather-grid">
                        <div class="weather-item">
                            <p><i class="fas fa-temperature-high"></i> Temperatura: ${weather.temperature?.toFixed(1)}°C</p>
                            <p><i class="fas fa-temperature-low"></i> Temperatura percepita: ${weather.feels_like?.toFixed(1)}°C</p>
                            <p><i class="fas fa-tint"></i> Umidità: ${weather.humidity}%</p>
                        </div>
                        <div class="weather-item">
                            <p><i class="fas fa-cloud-rain"></i> Precipitazioni: ${weather.precipitation} mm/h</p>
                            <p><i class="fas fa-umbrella"></i> Probabilità pioggia: ${weather.rain_probability}%</p>
                            <p><i class="fas fa-water"></i> Accumulo 24h: ${weather.rain_24h} mm</p>
                        </div>
                        <div class="weather-item">
                            <p><i class="fas fa-wind"></i> Velocità vento: ${weather.wind_speed} km/h</p>
                            <p><i class="fas fa-compass"></i> Direzione vento: ${weather.wind_direction}°</p>
                            <p><i class="fas fa-wind"></i> Raffica massima: ${weather.wind_gust} km/h</p>
                        </div>
                    </div>
                </div>
            `;
        }

        function updateSituationSummary(alerts) {
            const alertLevels = ['verde', 'giallo', 'arancione', 'rosso'];
            const highestLevel = alerts.reduce((highest, alert) => {
                const currentIndex = alertLevels.indexOf(alert.level.toLowerCase());
                const highestIndex = alertLevels.indexOf(highest);
                return currentIndex > highestIndex ? alert.level.toLowerCase() : highest;
            }, 'verde');

            const sectionHeader = document.querySelector('.section-header');
            sectionHeader.className = 'section-header';
            sectionHeader.classList.add(`level-${highestLevel}`);

            const situationText = document.getElementById('situation-text');
            const alertCount = alerts.filter(alert => alert.level.toLowerCase() !== 'verde').length;
            
            situationText.textContent = alertCount === 0 
                ? 'Nessuna allerta in corso' 
                : `${alertCount} zone in allerta - Livello massimo: ${highestLevel.toUpperCase()}`;
        }

        function showLoading(show = true) {
            elements.loading.classList.toggle('hidden', !show);
            elements.alertDetails.classList.toggle('hidden', show);
            elements.error.classList.toggle('hidden', true);
        }

        function showError(show = true) {
            elements.error.classList.toggle('hidden', !show);
            elements.loading.classList.toggle('hidden', true);
            elements.alertDetails.classList.toggle('hidden', true);
        }

        function updateAlertUI(data) {
            if (!data) return;
            
            elements.emissionDate.textContent = data.emissionDate;
            elements.generalStatus.textContent = data.generalStatus;
            elements.zoneAlerts.innerHTML = '';
            
            data.zoneAlerts.forEach(alert => {
                const zoneKey = alert.zone;
                const zoneInfo = ZONE_DETAILS[zoneKey];
                const zoneWeather = STATIC_WEATHER[zoneKey];
                
                if (!zoneInfo) {
                    console.warn(`Missing zone info for ${zoneKey}`);
                    return;
                }

                const listItem = document.createElement('div');
                listItem.classList.add('alert-item', `alert-level-${alert.level.toLowerCase()}`);
                
                listItem.innerHTML = `
                    <div class="alert-header" onclick="this.parentElement.querySelector('.alert-content').classList.toggle('collapsed')">
                        <h3>${zoneKey}</h3>
                        <span class="alert-status">Allerta ${alert.level.toUpperCase()}</span>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="alert-content collapsed">
                        <div class="alert-details">
                            <div class="alert-level-info">
                                <p class="alert-status">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <strong>Livello:</strong> ${alert.level.toUpperCase()} - ${alert.type}
                                </p>
                                <p class="alert-level-description">
                                    <i class="fas fa-info-circle"></i>
                                    ${getAlertLevelDescription(alert.level)}
                                </p>
                            </div>
                            <p class="alert-description">${zoneInfo.description}</p>
                            <div class="zone-info">
                                <p><i class="fas fa-users"></i> <strong>Popolazione:</strong> ${zoneInfo.population}</p>
                                <p><i class="fas fa-city"></i> <strong>Province:</strong> ${zoneInfo.provinces.join(', ')}</p>
                                <p><i class="fas fa-exclamation-triangle"></i> <strong>Rischi principali:</strong> ${zoneInfo.mainRisks.join(', ')}</p>
                                <p><i class="fas fa-mountain"></i> <strong>Altitudine:</strong> ${zoneInfo.elevation}</p>
                            </div>
                            ${zoneWeather ? renderWeatherInfo(zoneWeather) : ''}
                        </div>
                    </div>
                `;
                
                elements.zoneAlerts.appendChild(listItem);
            });

            updateSituationSummary(data.zoneAlerts);

            // Set Zona L status text if the element exists
            const zonaLAlert = data.zoneAlerts.find(alert => alert.zone.includes('Zona L'));
            const zonaLStatusText = document.getElementById('zone-l-status-text');
            if (zonaLAlert && zonaLStatusText) {
                const levelMap = {
                    'verde': 'Nessuna criticità',
                    'giallo': 'Attenzione: possibili temporali e allagamenti',
                    'arancione': 'Allerta arancione: fenomeni intensi previsti',
                    'rosso': 'Allerta rossa: fenomeni estremi previsti'
                };
                zonaLStatusText.textContent = levelMap[zonaLAlert.level.toLowerCase()] || '';
            }

            const alertNote = document.getElementById('alert-note');
            if (alertNote && data.note) {
                alertNote.innerHTML = `<i class="fas fa-sticky-note"></i> <strong>Nota:</strong> ${data.note}`;
            }
        }

        async function fetchAlertData() {
            showLoading();
            try {
                if (CONFIG.isStatic) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    showLoading(false);
                    updateAlertUI(staticData);
                } else {
                    const response = await fetch(CONFIG.xmlFeedUrl);
                    const xmlText = await response.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                    const noteNode = xmlDoc.querySelector('note');
                    const noteText = noteNode ? noteNode.textContent.trim() : "";
                    const onsetNode = xmlDoc.querySelector('onset');
                    const expiresNode = xmlDoc.querySelector('expires');
                    const onsetText = onsetNode ? onsetNode.textContent.trim() : "";
                    const expiresText = expiresNode ? expiresNode.textContent.trim() : "";

                    // ...parse zoneAlerts as before...
                    const zoneAlerts = parseZoneAlertsFromXML(xmlText);

                    if (zoneAlerts) {
                        const data = {
                            ...staticData,
                            zoneAlerts,
                            emissionDate: new Date().toLocaleString('it-IT'),
                            note: noteText,
                            onset: onsetText,
                            expires: expiresText
                        };
                        showLoading(false);
                        updateAlertUI(data);
                    } else {
                        throw new Error('Failed to parse zone alerts from XML');
                    }
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
    }

    // --- INDEX PAGE LOGIC (ZONA L ONLY) ---
    if (exists('zone-l-alert-level')) {
        // Static data for Zona L only
        const zonaLAlert = {
            emissionDate: new Date().toLocaleString('it-IT'),
            alertLevel: 'giallo',
            alertType: 'Temporali',
            precipitation: 'Moderata - 20-40mm/24h',
            thunderstorms: 'Possibili temporali locali',
            wind: 'Raffiche fino a 40km/h',
            recommendations: 'Prestare attenzione agli spostamenti e monitorare gli aggiornamenti meteo. Evitare zone soggette ad allagamenti.'
        };

        const emissionDate = document.getElementById('emission-date');
        const alertLevel = document.getElementById('zone-l-alert-level');
        const precipitation = document.getElementById('precipitation');
        const thunderstorms = document.getElementById('thunderstorms');
        const wind = document.getElementById('wind');
        const recommendations = document.getElementById('zone-l-recommendations');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const generalStatus = document.getElementById('general-status'); // <-- add this line

        function updateUI() {
            emissionDate.textContent = zonaLAlert.emissionDate;
            alertLevel.textContent = `${zonaLAlert.alertLevel.toUpperCase()} - ${zonaLAlert.alertType}`;
            alertLevel.className = `alert-badge ${zonaLAlert.alertLevel.toLowerCase()}`;
            precipitation.textContent = `Precipitazioni: ${zonaLAlert.precipitation}`;
            thunderstorms.textContent = `Temporali: ${zonaLAlert.thunderstorms}`;
            wind.textContent = `Vento: ${zonaLAlert.wind}`;
            recommendations.textContent = zonaLAlert.recommendations;

            const alertDescriptions = {
                'verde': 'Nessuna criticità',
                'giallo': 'Attenzione: possibili temporali e allagamenti',
                'arancione': 'Allerta arancione: fenomeni intensi previsti',
                'rosso': 'Allerta rossa: fenomeni estremi previsti'
            };
            document.getElementById('zone-l-alert-description').textContent = alertDescriptions[zonaLAlert.alertLevel] || '';
            if (generalStatus) generalStatus.textContent = alertDescriptions[zonaLAlert.alertLevel] || '';

            // ADD THIS FOR THE NOTE
            const alertNote = document.getElementById('alert-note');
            if (alertNote) {
                alertNote.innerHTML = `<i class="fas fa-sticky-note"></i> <strong>Nota:</strong> Questa è una nota di esempio proveniente dal feed ARPA Piemonte.`;
            }
        }

        function showLoading(show = true) {
            loading.classList.toggle('hidden', !show);
        }

        function showError(show = true) {
            error.classList.toggle('hidden', !show);
        }

        // Simulate loading
        showLoading(true);
        setTimeout(() => {
            showLoading(false);
            updateUI();
        }, 500);
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