import { fetchJSONData } from './utils/json.js';

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

    const targetElement = document.getElementById('json-table-container');

    const paramList = [
        'date',
        'hydrometric_level'
    ];

    async function fetchWithRetry(retryCount = 0, proxyIndex = 0) {
        const proxy = CONFIG.corsProxyUrls[proxyIndex];
        const proxiedUrl = proxy + encodeURIComponent(CONFIG.jsonApiUrl);

        try {
            let data = await fetchJSONData(proxiedUrl, paramList, 'data');

            // Ordinamento per data decrescente
            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (data && data.length > 0) {
                renderTable(data);
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
        table.classList.add('json-table');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Data</th>
                <th>Livello Idrometrico</th>
                <th>Livello Soglia</th>
                <th>Threshold di Guardia</th>
                <th>Threshold di Pericolo</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const { date, hydrometric_level } = row;
            let levelColor = 'green'; // Default color
            let icon = ''; // Icona predefinita
            let thresholdMessage = '';

            // Logica per colorare in base ai livelli
            if (hydrometric_level > danger_threshold) {
                levelColor = 'white'; // Pericolo
                icon = '⚠️';
                thresholdMessage = 'Supera il threshold di pericolo';
            } else if (hydrometric_level > guard_threshold) {
                levelColor = 'white'; // Allerta
                icon = '⚠️';
                thresholdMessage = 'Supera il threshold di guardia';
            } else if (hydrometric_level > threshold_level) {
                levelColor = 'white'; // Info
                icon = 'ℹ️';
                thresholdMessage = 'Sotto il threshold di guardia';
            } else {
                levelColor = 'white'; // Normale
                icon = '✅';
                thresholdMessage = 'Normale';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(date).toLocaleDateString()}</td>
                <td style="background-color: ${levelColor};">${hydrometric_level} ${icon}</td>
                <td>${threshold_level}</td>
                <td>${guard_threshold}</td>
                <td>${danger_threshold}</td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);

        targetElement.innerHTML = ''; // Pulisce la tabella esistente
        targetElement.appendChild(table);
    }

    fetchWithRetry();
});
