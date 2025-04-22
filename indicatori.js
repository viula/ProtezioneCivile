import { fetchJSONData } from './utils/json.js';

document.addEventListener('DOMContentLoaded', function () {
    const CONFIG = {
        jsonApiUrl: 'https://utility.arpa.piemonte.it/api_realtime/data_pie?station_code=131&page=1&page_size=48',
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

            // Logica per colorare in base ai livelli
            if (hydrometric_level > danger_threshold) {
                levelColor = 'red'; // Pericolo
                icon = '⚠️';
                thresholdMessage = 'ATTENZIONE: supera il livello di pericolo';
            } else if (hydrometric_level > guard_threshold) {
                levelColor = 'orange'; // Allerta
                icon = '⚠️';
                thresholdMessage = 'ALLERTA: supera il livello di guardia';
            } else if (hydrometric_level > threshold_level) {
                levelColor = 'blue'; // Info
                icon = 'ℹ️';
                thresholdMessage = 'Sotto il livello di guardia';
            } else {
                levelColor = 'black'; // Normale
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

        targetElement.innerHTML = ''; // Pulisce la tabella esistente
        targetElement.appendChild(table);
    }

    function drawHydroGraph(data) {
        const canvas = document.getElementById('hydroChart');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(50, 10);
        ctx.lineTo(50, canvas.height - 30);
        ctx.stroke();

    
        const padding = 50;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
    
        // Filtra valori validi
        const levels = data.map(d => parseFloat(d.hydrometric_level)).filter(n => !isNaN(n));
        const maxLevel = Math.max(danger_threshold, ...levels);
        const minLevel = Math.min(...levels);
        const scaleY = height / (maxLevel - minLevel);
        const stepX = width / (levels.length - 1);
    
        const points = levels.map((level, i) => ({
            x: padding + i * stepX,
            y: canvas.height - padding - (level - minLevel) * scaleY
        }));

        // Disegna tacche ed etichette sull'asse Y
        const step = 0.5; // passo per le tacche sull’asse Y
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';

        for (let y = Math.ceil(minLevel); y <= Math.floor(maxLevel); y += step) {
            const yPos = canvas.height - 30 - ((y - minLevel) / (maxLevel - minLevel)) * (canvas.height - 40);
            
            // linea della tacca
            ctx.beginPath();
            ctx.moveTo(45, yPos);
            ctx.lineTo(50, yPos);
            ctx.stroke();

            // testo del valore numerico
            ctx.fillText(y.toFixed(1), 40, yPos + 4);
        }

    
        // Disegna linea livello idrometrico
        ctx.beginPath();
        ctx.strokeStyle = 'deepskyblue';
        ctx.lineWidth = 2;
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    
        // Disegna linee soglia
        const drawThreshold = (value, color) => {
            const y = canvas.height - padding - (value - minLevel) * scaleY;
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = color;
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            ctx.setLineDash([]);
        };
    
        drawThreshold(threshold_level, 'green');
        drawThreshold(guard_threshold, 'orange');
        drawThreshold(danger_threshold, 'red');
    }    

    fetchWithRetry();
});
