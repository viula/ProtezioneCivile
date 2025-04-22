import { fetchJSONData } from '../utils/json.js';

import { LineChart } from '../utils/graphic.js';

document.addEventListener('DOMContentLoaded', function () {
    const CONFIG = {
        jsonApiUrl: 'https://utility.arpa.piemonte.it/api_realtime/data_pie?station_code=131&page=1&page_size=100',
        corsProxyUrls: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-anywhere.herokuapp.com/'
        ],
        retryDelay: 5000,
        maxRetries: 3
    };

    const threshold_level = 4.3;
    const guard_threshold = 4.9;
    const danger_threshold = 5.8;

    const targetElement = document.getElementById('table-container');
    const thresholdElement = document.getElementById('threshold-level');

    thresholdElement.innerHTML = `<div class="card">Livello soglia: ${threshold_level} m (<strong style="color:green">----</strong>)<br>` +
        `Livello di guardia: ${guard_threshold} m (<strong style="color:orange">----</strong>)<br>` +
        `Livello di pericolo: ${danger_threshold} m (<strong style="color:red">----</strong>)</div>`;

    const paramList = [
        'date',
        'hydrometric_level'
    ];

    async function fetchWithRetry(retryCount = 0, proxyIndex = 0) {
        const proxy = CONFIG.corsProxyUrls[proxyIndex];
        const proxiedUrl = proxy + encodeURIComponent(CONFIG.jsonApiUrl);

        try {
            let data = await fetchJSONData(proxiedUrl, paramList, 'data');

            // Ordinamento per data crescente
            data.sort((a, b) => new Date(a.date) - new Date(b.date));

            if (data && data.length > 0) {
                renderTable(data);
                drawHydroGraph(data);
            } else {
                console.warn('Nessun dato disponibile.');
            }
        } catch (error) {
            console.error('Errore nel fetch JSON:', error);
            tryNextProxy(retryCount, proxyIndex);
        }
    }

    function tryNextProxy(retryCount, currentProxyIndex) {
        if (currentProxyIndex < CONFIG.corsProxyUrls.length - 1) {
            console.log(`Provo proxy successivo...`);
            fetchWithRetry(retryCount, currentProxyIndex + 1);
        } else if (retryCount < CONFIG.maxRetries) {
            console.log(`Tutti i proxy falliti. Riprovo tra ${CONFIG.retryDelay}ms...`);
            setTimeout(() => fetchWithRetry(retryCount + 1, 0), CONFIG.retryDelay);
        } else {
            console.error('Tutti i tentativi falliti.');
        }
    }

    function renderTable(data) {
        const table = document.createElement('table');
        table.classList.add('table');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Data</th>
                <th>Livello</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const { date, hydrometric_level } = row;
            let levelColor = 'green'; // Default color
            let icon = ''; // Icona predefinita
            let thresholdMessage = '';

            if (hydrometric_level > danger_threshold) {
                levelColor = 'red';
                icon = '⚠️';
                thresholdMessage = 'ATTENZIONE: supera il livello di pericolo';
            } else if (hydrometric_level > guard_threshold) {
                levelColor = 'orange';
                icon = '⚠️';
                thresholdMessage = 'ALLERTA: supera il livello di guardia';
            } else if (hydrometric_level > threshold_level) {
                levelColor = 'blue';
                icon = 'ℹ️';
                thresholdMessage = 'Sotto il livello di guardia';
            } else {
                levelColor = 'black';
                icon = '✅';
                thresholdMessage = 'Normale';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(date).toLocaleDateString()}, h. ${new Date(date).getHours()}</td>
                <td style="color: ${levelColor};">${icon} ${hydrometric_level}<br />${thresholdMessage}</td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        targetElement.innerHTML = '';
        targetElement.appendChild(table);
    }

    function drawHydroGraph(data) {
        const canvas = document.getElementById('hydroChart');
        if (!canvas) return;
    
        const levels = data.map(d => parseFloat(d.hydrometric_level)).filter(n => !isNaN(n));
        const labels = data.map(d => new Date(d.date).getHours().toString().padStart(2, '0'));
    
        // Aggiungi le linee dei threshold
        const thresholdLevels = {
            threshold_level: threshold_level,
            guard_threshold: guard_threshold,
            danger_threshold: danger_threshold
        };
    
        const thresholdData = {
            threshold_level: Array(levels.length).fill(thresholdLevels.threshold_level),
            guard_threshold: Array(levels.length).fill(thresholdLevels.guard_threshold),
            danger_threshold: Array(levels.length).fill(thresholdLevels.danger_threshold)
        };
    
        const chart = new LineChart({
            id: 'hydroChart',
            data: levels,
            labels: labels,
            colors: ['deepskyblue'],
            tooltips: true,
            threshold_level: threshold_level,
            guard_threshold: guard_threshold,
            danger_threshold: danger_threshold,
            additionalData: thresholdData,
        });
    
        chart.draw();
    }
    
    

    fetchWithRetry();
});