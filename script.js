document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const CONFIG = {
        refreshInterval: 5 * 60 * 1000, // 5 minutes
        xmlFeedUrl: 'https://www.arpa.piemonte.it/export/xmlcap/allerta.xml',
        isStatic: true // Flag for static mode
    };

    // DOM Elements
    const elements = {
        alertDetails: document.getElementById('alert-details'),
        emissionDate: document.getElementById('emission-date'),
        generalStatus: document.getElementById('general-status'),
        zoneAlerts: document.getElementById('zone-alerts'),
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        temperature: document.getElementById('temperature'),
        humidity: document.getElementById('humidity'),
        pressure: document.getElementById('pressure'),
        precipitation: document.getElementById('precipitation'),
        weatherDetails: document.getElementById('weather-details'),
        feelsLike: document.getElementById('feels-like'),
        dewPoint: document.getElementById('dew-point'),
        rainProbability: document.getElementById('rain-probability'),
        rain24h: document.getElementById('rain-24h'),
        windSpeed: document.getElementById('wind-speed'),
        windDirection: document.getElementById('wind-direction'),
        windGust: document.getElementById('wind-gust'),
        visibility: document.getElementById('visibility'),
        cloudCover: document.getElementById('cloud-cover'),
        uvIndex: document.getElementById('uv-index')
    };

    // Static data structure with empty zones (fallback)
    const staticData = {
        emissionDate: new Date().toLocaleString('it-IT'),
        generalStatus: 'Normale',
        zoneAlerts: []
    };

    // Zone details configuration
    const ZONE_DETAILS = {
        'Zona A (Torinese)': {
            description: 'Area metropolitana di Torino e valli circostanti',
            population: '2.2 milioni',
            provinces: ['Torino'],
            mainRisks: ['Alluvioni', 'Frane'],
            elevation: '200-3000m'
        },
        'Zona B (Alessandrino)': {
            description: 'Pianura alessandrina e area appenninica',
            population: '420.000',
            provinces: ['Alessandria', 'Asti'],
            mainRisks: ['Alluvioni', 'Siccità'],
            elevation: '100-1700m'
        },
        'Zona C (Cuneese)': {
            description: 'Area alpina e pianura cuneese',
            population: '590.000',
            provinces: ['Cuneo'],
            mainRisks: ['Valanghe', 'Frane'],
            elevation: '300-4000m'
        },
        'Zona D (Novarese)': {
            description: 'Pianura novarese e vercellese',
            population: '520.000',
            provinces: ['Novara', 'Vercelli'],
            mainRisks: ['Alluvioni', 'Temporali'],
            elevation: '100-2000m'
        },
        'Zona E (VCO)': {
            description: 'Area alpina del Verbano-Cusio-Ossola',
            population: '160.000',
            provinces: ['Verbano-Cusio-Ossola'],
            mainRisks: ['Valanghe', 'Alluvioni'],
            elevation: '200-4600m'
        }
    };

    // Replace the STATIC_WEATHER object with zone-specific weather data
    const STATIC_WEATHER = {
        'Zona A (Torinese)': {
            temperature: 18.5,
            humidity: 65,
            pressure: 1013,
            precipitation: 0,
            feels_like: 18.2,
            dew_point: 12.1,
            rain_probability: 20,
            rain_24h: 0.5,
            wind_speed: 15,
            wind_direction: 180,
            wind_gust: 25,
            visibility: 10,
            cloud_cover: 30,
            uv_index: 5
        },
        'Zona B (Alessandrino)': {
            temperature: 20.1,
            humidity: 60,
            pressure: 1012,
            precipitation: 0.2,
            feels_like: 19.8,
            dew_point: 11.5,
            rain_probability: 30,
            rain_24h: 1.2,
            wind_speed: 12,
            wind_direction: 165,
            wind_gust: 20,
            visibility: 8,
            cloud_cover: 40,
            uv_index: 4
        },
        'Zona C (Cuneese)': {
            temperature: 16.2,
            humidity: 70,
            pressure: 1010,
            precipitation: 0.5,
            feels_like: 15.8,
            dew_point: 13.2,
            rain_probability: 45,
            rain_24h: 2.5,
            wind_speed: 18,
            wind_direction: 220,
            wind_gust: 30,
            visibility: 6,
            cloud_cover: 60,
            uv_index: 3
        },
        'Zona D (Novarese)': {
            temperature: 19.5,
            humidity: 62,
            pressure: 1014,
            precipitation: 0,
            feels_like: 19.0,
            dew_point: 11.8,
            rain_probability: 15,
            rain_24h: 0,
            wind_speed: 10,
            wind_direction: 150,
            wind_gust: 18,
            visibility: 12,
            cloud_cover: 25,
            uv_index: 6
        },
        'Zona E (VCO)': {
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
        }
    };

    function parseZoneAlertsFromXML(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            const alerts = [];
            
            // Get all zone elements from XML
            const zoneElements = xmlDoc.getElementsByTagName('zone');
            
            Array.from(zoneElements).forEach(zone => {
                const zoneData = {
                    zone: zone.getAttribute('name') || 'Zona non specificata',
                    level: zone.getAttribute('level')?.toLowerCase() || 'verde',
                    type: zone.getAttribute('type') || 'Idrogeologica'
                };
                alerts.push(zoneData);
            });

            return alerts;
        } catch (error) {
            console.error('Error parsing XML:', error);
            return null;
        }
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

    async function fetchWeatherData() {
        try {
            if (CONFIG.isStatic) {
                // Use static weather data
                elements.temperature.textContent = `${STATIC_WEATHER.temperature.toFixed(1)}°C`;
                elements.humidity.textContent = `${STATIC_WEATHER.humidity}%`;
                elements.pressure.textContent = `${STATIC_WEATHER.pressure} hPa`;
                elements.precipitation.textContent = `${STATIC_WEATHER.precipitation} mm/h`;
                elements.feelsLike.textContent = `${STATIC_WEATHER.feels_like.toFixed(1)}°C`;
                elements.dewPoint.textContent = `${STATIC_WEATHER.dew_point.toFixed(1)}°C`;
                elements.rainProbability.textContent = `${STATIC_WEATHER.rain_probability}%`;
                elements.rain24h.textContent = `${STATIC_WEATHER.rain_24h} mm`;
                elements.windSpeed.textContent = `${STATIC_WEATHER.wind_speed} km/h`;
                elements.windDirection.textContent = `${STATIC_WEATHER.wind_direction}°`;
                elements.windGust.textContent = `${STATIC_WEATHER.wind_gust} km/h`;
                elements.visibility.textContent = `${STATIC_WEATHER.visibility} km`;
                elements.cloudCover.textContent = `${STATIC_WEATHER.cloud_cover}%`;
                elements.uvIndex.textContent = STATIC_WEATHER.uv_index;
                
                elements.weatherDetails.classList.remove('hidden');
                return;
            }

            // Only attempt to fetch if not in static mode
            const response = await fetch('https://www.arpa.piemonte.it/rischi_naturali/widget/comuni/001272/index.json');
            const data = await response.json();
            
            if (data && data.measurements) {
                elements.temperature.textContent = `${data.measurements.temperature?.toFixed(1)}°C`;
                elements.humidity.textContent = `${data.measurements.humidity}%`;
                elements.pressure.textContent = `${data.measurements.pressure} hPa`;
                elements.precipitation.textContent = `${data.measurements.precipitation} mm/h`;
                elements.feelsLike.textContent = `${data.measurements.feels_like?.toFixed(1)}°C`;
                elements.dewPoint.textContent = `${data.measurements.dew_point?.toFixed(1)}°C`;
                elements.rainProbability.textContent = `${data.measurements.rain_probability}%`;
                elements.rain24h.textContent = `${data.measurements.rain_24h} mm`;
                elements.windSpeed.textContent = `${data.measurements.wind_speed} km/h`;
                elements.windDirection.textContent = `${data.measurements.wind_direction}°`;
                elements.windGust.textContent = `${data.measurements.wind_gust} km/h`;
                elements.visibility.textContent = `${data.measurements.visibility} km`;
                elements.cloudCover.textContent = `${data.measurements.cloud_cover}%`;
                elements.uvIndex.textContent = data.measurements.uv_index;
                
                elements.weatherDetails.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            // Fallback to static data on error
            fetchWeatherData(); // It will use static data due to CONFIG.isStatic being true
        }
    }

    async function fetchAlertData() {
        showLoading();
        
        try {
            if (CONFIG.isStatic) {
                // Simulate loading delay
                await new Promise(resolve => setTimeout(resolve, 500));
                const data = staticData;
                data.zoneAlerts = [
                    { zone: 'Zona A (Torinese)', level: 'verde', type: 'Idrogeologica' },
                    { zone: 'Zona B (Alessandrino)', level: 'giallo', type: 'Idraulica' },
                    { zone: 'Zona C (Cuneese)', level: 'verde', type: 'Idrogeologica' },
                    { zone: 'Zona D (Novarese)', level: 'verde', type: 'Idraulica' },
                    { zone: 'Zona E (VCO)', level: 'giallo', type: 'Idrogeologica' }
                ];
                showLoading(false);
                updateAlertUI(data);
            } else {
                await Promise.all([
                    fetch(CONFIG.xmlFeedUrl),
                    fetchWeatherData()
                ]);
                const response = await fetch(CONFIG.xmlFeedUrl);
                const xmlText = await response.text();
                const zoneAlerts = parseZoneAlertsFromXML(xmlText);
                
                if (zoneAlerts) {
                    const data = {
                        ...staticData,
                        zoneAlerts,
                        emissionDate: new Date().toLocaleString('it-IT')
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

    function getAlertLevelDescription(level) {
        const descriptions = {
            'verde': 'Condizioni ordinarie: fenomeni naturali che non prevedono danni.',
            'giallo': 'Potenziali pericoli: possibili danni localizzati.',
            'arancione': 'Pericoli diffusi: probabili danni estesi.',
            'rosso': 'Pericoli gravi: danni diffusi e ingenti.'
        };
        return descriptions[level.toLowerCase()] || '';
    }

    function updateAlertUI(data) {
        if (!data) return;
        
        elements.emissionDate.textContent = data.emissionDate;
        elements.generalStatus.textContent = data.generalStatus;
        
        // Hide the general weather details section
        elements.weatherDetails.classList.add('hidden');
        
        // Clear and update alerts list
        elements.zoneAlerts.innerHTML = '';
        
        data.zoneAlerts.forEach(alert => {
            const zoneInfo = ZONE_DETAILS[alert.zone] || {};
            const zoneWeather = STATIC_WEATHER[alert.zone] || {};
            const listItem = document.createElement('div');
            listItem.classList.add('alert-item', `alert-level-${alert.level.toLowerCase()}`);
            
            listItem.innerHTML = `
                <div class="alert-header" onclick="this.parentElement.querySelector('.alert-content').classList.toggle('collapsed')">
                    <h3>${alert.zone}</h3>
                    <span class="alert-status">Allerta ${alert.level}</span>
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
                        <p class="alert-description">${zoneInfo.description || ''}</p>
                        <div class="zone-info">
                            <p><i class="fas fa-users"></i> <strong>Popolazione:</strong> ${zoneInfo.population || 'N/D'}</p>
                            <p><i class="fas fa-city"></i> <strong>Province:</strong> ${zoneInfo.provinces?.join(', ') || 'N/D'}</p>
                            <p><i class="fas fa-exclamation-triangle"></i> <strong>Rischi principali:</strong> ${zoneInfo.mainRisks?.join(', ') || 'N/D'}</p>
                            <p><i class="fas fa-mountain"></i> <strong>Altitudine:</strong> ${zoneInfo.elevation || 'N/D'}</p>
                        </div>
                        <div class="weather-info">
                            <h4><i class="fas fa-cloud-sun"></i> Condizioni Meteo</h4>
                            <div class="weather-grid">
                                <div class="weather-item">
                                    <p><i class="fas fa-temperature-high"></i> Temperatura: ${zoneWeather.temperature?.toFixed(1)}°C</p>
                                    <p><i class="fas fa-temperature-low"></i> Temperatura percepita: ${zoneWeather.feels_like?.toFixed(1)}°C</p>
                                    <p><i class="fas fa-tint"></i> Umidità: ${zoneWeather.humidity}%</p>
                                </div>
                                <div class="weather-item">
                                    <p><i class="fas fa-cloud-rain"></i> Precipitazioni: ${zoneWeather.precipitation} mm/h</p>
                                    <p><i class="fas fa-umbrella"></i> Probabilità pioggia: ${zoneWeather.rain_probability}%</p>
                                    <p><i class="fas fa-water"></i> Accumulo 24h: ${zoneWeather.rain_24h} mm</p>
                                </div>
                                <div class="weather-item">
                                    <p><i class="fas fa-wind"></i> Velocità vento: ${zoneWeather.wind_speed} km/h</p>
                                    <p><i class="fas fa-compass"></i> Direzione vento: ${zoneWeather.wind_direction}°</p>
                                    <p><i class="fas fa-wind"></i> Raffica massima: ${zoneWeather.wind_gust} km/h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            elements.zoneAlerts.appendChild(listItem);
        });

        // Find highest alert level
        const alertLevels = ['verde', 'giallo', 'arancione', 'rosso'];
        const highestLevel = data.zoneAlerts.reduce((highest, alert) => {
            const currentIndex = alertLevels.indexOf(alert.level.toLowerCase());
            const highestIndex = alertLevels.indexOf(highest);
            return currentIndex > highestIndex ? alert.level.toLowerCase() : highest;
        }, 'verde');

        // Update section header
        const sectionHeader = document.querySelector('.section-header');
        sectionHeader.className = 'section-header';
        sectionHeader.classList.add(`level-${highestLevel}`);

        // Update situation text
        const situationText = document.getElementById('situation-text');
        const alertCount = data.zoneAlerts.filter(alert => alert.level.toLowerCase() !== 'verde').length;
        
        if (alertCount === 0) {
            situationText.textContent = 'Nessuna allerta in corso';
        } else {
            situationText.textContent = `${alertCount} zone in allerta - Livello massimo: ${highestLevel.toUpperCase()}`;
        }
    }

    // Initialize
    fetchAlertData();

    // Set up auto-refresh (simulated data updates)
    if (CONFIG.refreshInterval > 0) {
        setInterval(fetchAlertData, CONFIG.refreshInterval);
    }
});

function toggleLegendModal() {
    const modal = document.getElementById('legendModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('legendModal');
    if (event.target === modal) {
        toggleLegendModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('legendModal');
        if (modal.style.display === 'block') {
            toggleLegendModal();
        }
    }
});