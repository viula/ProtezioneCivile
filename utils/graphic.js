// File: graphic.js
// Funzione per disegnare grafici a barre, a linee e a torta
// Utilizza il canvas HTML5 per il rendering dei grafici
// Parametri:
// - options: oggetto contenente le opzioni per il grafico
//   - id: ID del canvas HTML in cui disegnare il grafico
//   - data: array di dati da visualizzare
//   - colors: array di colori per le barre/linee/fette del grafico
//   - labels: array di etichette per le barre/linee/fette del grafico
//   - tooltips: booleano per abilitare/disabilitare i tooltip
//   - barWidth: larghezza delle barre (solo per grafico a barre)
//   - gap: spazio tra le barre (solo per grafico a barre)
//   - height: altezza del canvas
//   - width: larghezza del canvas
//   - containerId: ID del contenitore per la legenda (solo per grafico a barre)
//   - legendData: array di dati per la legenda (solo per grafico a barre)
//   - legendColors: array di colori per la legenda (solo per grafico a barre)
//   - axisLabels: array di etichette per gli assi (solo per grafico a barre)
//   - axisId: ID del canvas per gli assi (solo per grafico a barre)
//   - axisColors: array di colori per gli assi (solo per grafico a barre)
//   - axisWidth: larghezza del canvas per gli assi (solo per grafico a barre)
//   - axisHeight: altezza del canvas per gli assi (solo per grafico a barre)
//   - axisGap: spazio tra le barre e gli assi (solo per grafico a barre)
//   - axisLabelsX: array di etichette per l'asse X (solo per grafico a barre)
//   - axisLabelsY: array di etichette per l'asse Y (solo per grafico a barre)
//   - axisLabelsXColor: colore delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYColor: colore delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXFont: font delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYFont: font delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXSize: dimensione del font delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYSize: dimensione del font delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXWeight: peso del font delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYWeight: peso del font delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXStyle: stile del font delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYStyle: stile del font delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXAlign: allineamento delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYAlign: allineamento delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXBaseline: baseline delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYBaseline: baseline delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXDirection: direzione delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYDirection: direzione delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXTransform: trasformazione delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYTransform: trasformazione delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXTransformX: trasformazione X delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYTransformX: trasformazione X delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXTransformY: trasformazione Y delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYTransformY: trasformazione Y delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXTransformWidth: larghezza della trasformazione delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYTransformWidth: larghezza della trasformazione delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXTransformHeight: altezza della trasformazione delle etichette dell'asse X (solo per grafico a barre)
//   - axisLabelsYTransformHeight: altezza della trasformazione delle etichette dell'asse Y (solo per grafico a barre)
//   - axisLabelsXTransformColor: colore della trasformazione delle etichette dell'asse X (solo per grafico a barre)

// File: graphic.js
// Funzione per disegnare grafici a barre, a linee e a torta
// Utilizza il canvas HTML5 per il rendering dei grafici

export class BarChart {
    constructor(options) {
        this.canvas = document.getElementById(options.id);
        this.ctx = this.canvas.getContext('2d');
        this.data = options.data || [];
        this.colors = options.colors || ['#3498db'];
        this.barWidth = options.barWidth || 50;
        this.gap = options.gap || 10;
        this.height = options.height || 300;
        this.width = options.width || 400;
        this.labels = options.labels || [];
        this.tooltips = options.tooltips || false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#2c3e50';
        const baseY = this.height - 10;

        for (let i = 0; i < this.data.length; i++) {
            const x = i * (this.barWidth + this.gap);
            const y = baseY - this.data[i];
            const color = this.colors[i % this.colors.length];

            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, this.barWidth, this.data[i]);

            if (this.labels[i]) {
                this.ctx.fillStyle = '#000';
                this.ctx.fillText(this.labels[i], x + this.barWidth / 2 - this.ctx.measureText(this.labels[i]).width / 2, baseY + 15);
            }

            if (this.tooltips) {
                this.canvas.addEventListener('mousemove', (e) => {
                    const mouseX = e.offsetX;
                    const mouseY = e.offsetY;

                    if (mouseX >= x && mouseX <= x + this.barWidth && mouseY <= baseY && mouseY >= y) {
                        this.showTooltip(e, this.data[i]);
                    }
                });
            }
        }
    }

    showTooltip(event, value) {
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = '#f39c12';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '5px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.pointerEvents = 'none';
        tooltip.textContent = `Value: ${value}`;
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 30}px`;

        document.body.appendChild(tooltip);

        setTimeout(() => tooltip.remove(), 1000);
    }
}

export class LineChart {
    constructor(options) {
        this.canvas = document.getElementById(options.id);
        this.ctx = this.canvas.getContext('2d');
        this.data = options.data || [];
        this.colors = options.colors || ['#3498db'];
        this.labels = options.labels || [];
        this.tooltips = options.tooltips || false;

        // Thresholds
        this.threshold_level = options.threshold_level || 0;
        this.guard_threshold = options.guard_threshold || 0;
        this.danger_threshold = options.danger_threshold || 0;
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.data.length === 0) return;

        const maxValue = this.danger_threshold + 1;//Math.max(...this.data);
        const minValue = 0;//Math.min(...this.data);
        const range = maxValue - minValue || 1;

        const padding = 40;
        const chartHeight = canvas.height - padding * 2;
        const chartWidth = canvas.width - padding * 2;

        const pointSpacing = chartWidth / (this.data.length - 1);

        ctx.beginPath();

        // Disegno della linea dei dati
        this.data.forEach((value, index) => {
            const x = padding + index * pointSpacing;
            const y = padding + chartHeight * (1 - (value - minValue) / range);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.strokeStyle = this.colors[0];
        ctx.lineWidth = 2;
        ctx.stroke();

        // Controllo e disegno delle linee dei threshold
        if (this.threshold_level !== undefined) {
            this.drawThresholdLine(this.threshold_level, 'green', padding, pointSpacing, minValue, maxValue);
        }
        if (this.guard_threshold !== undefined) {
            this.drawThresholdLine(this.guard_threshold, 'orange', padding, pointSpacing, minValue, maxValue);
        }
        if (this.danger_threshold !== undefined) {
            this.drawThresholdLine(this.danger_threshold, 'red', padding, pointSpacing, minValue, maxValue);
        }

        // LineChart: Funzione per il tooltip sui punti
        this.canvas.addEventListener('mousemove', (e) => {
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            // Calcolare se il mouse è sopra un punto della linea
            this.data.forEach((value, index) => {
                const x = padding + index * pointSpacing;
                const y = padding + chartHeight * (1 - (value - minValue) / range);
                const distance = Math.hypot(mouseX - x, mouseY - y);

                if (distance < 10) {  // Radius del "punto" per il tooltip
                    this.showTooltip(e, value, this.labels[index]);
                }
            });
        });


        // Aggiungi le etichette numeriche sull'asse Y
        this.drawYAxisLabels(minValue, maxValue, range, padding, chartHeight);
        this.drawLegend();  // Aggiungi la legenda

    }

    drawThresholdLine(threshold, color, padding, pointSpacing, minValue, maxValue) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const chartHeight = canvas.height - padding * 2;

        // Calcolare la posizione Y della soglia in base al range dei dati
        const range = maxValue - minValue;
        const thresholdY = padding + chartHeight * (1 - (threshold - minValue) / range);

        // Assicurarsi che thresholdY sia dentro l'area visibile (evitare valori negativi o superiori al massimo)
        const clampedY = Math.min(Math.max(thresholdY, padding), padding + chartHeight);

        // Disegnare la linea della soglia
        ctx.beginPath();
        ctx.moveTo(padding, clampedY);
        ctx.lineTo(canvas.width - padding, clampedY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Doppia linea tratteggiata
        ctx.stroke();
        ctx.setLineDash([]); // Resetta lo stile tratteggiato
    }


    // Funzione per disegnare le etichette numeriche sull'asse Y
    drawYAxisLabels(minValue, maxValue, range, padding, chartHeight) {
        const ctx = this.ctx;
        const canvas = this.canvas;

        const numLabels = 5; // Numero di etichette per l'asse Y
        const step = range / (numLabels - 1);

        // Disegna le etichette numeriche dell'asse Y
        for (let i = 0; i < numLabels; i++) {
            const value = minValue + i * step;
            const y = padding + chartHeight * (1 - (value - minValue) / range);
            ctx.fillStyle = '#000';
            ctx.fillText(value.toFixed(2), 20, y);
        }
    }

    // Funzione per mostrare il tooltip
    showTooltip(e, value, label) {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'block';
        tooltip.style.left = `${e.offsetX + 10}px`;
        tooltip.style.top = `${e.offsetY + 10}px`;
        tooltip.innerHTML = `${label}: ${value}`;  // Mostra il label e il valore
    }

    // Funzione per nascondere il tooltip
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }

    // Funzione per disegnare la legenda
    drawLegend() {
        const legendX = this.width - 150; // Posizione orizzontale della legenda
        const legendY = 20; // Posizione verticale della legenda
        const boxSize = 15; // Dimensione del quadrato di colore

        // Itera sui dati per disegnare la legenda
        this.data.forEach((_, i) => {
            const x = legendX;
            const y = legendY + i * (boxSize + 5);
            const color = this.colors[i % this.colors.length];
            const label = this.labels[i] || 'Data ' + (i + 1);  // Etichetta di fallback

            // Disegna il quadrato colorato
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, boxSize, boxSize);

            // Aggiungi il testo della legenda
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(label, x + boxSize + 5, y + boxSize / 2);
        });
    }


}


export class PieChart {
    constructor(options) {
        this.canvas = document.getElementById(options.id);
        this.ctx = this.canvas.getContext('2d');
        this.data = options.data || [];
        this.colors = options.colors || ['#3498db'];
        // PieChart: Tooltip per le fette
        this.canvas.addEventListener('mousemove', (e) => {
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            let currentAngle = -Math.PI / 2;
            for (let i = 0; i < this.data.length; i++) {
                const sliceAngle = (this.data[i] / total) * (Math.PI * 2);
                const startAngle = currentAngle;
                const endAngle = currentAngle + sliceAngle;

                // Calcolare se il mouse è sopra la fetta
                const distance = Math.hypot(mouseX - this.canvas.width / 2, mouseY - this.canvas.height / 2);
                if (distance < this.canvas.height / 2) {
                    const angle = Math.atan2(mouseY - this.canvas.height / 2, mouseX - this.canvas.width / 2);
                    if (angle >= startAngle && angle <= endAngle) {
                        this.showTooltip(e, this.data[i], `Slice ${i + 1}`);
                    }
                }

                currentAngle += sliceAngle;
            }
        });

    }

    draw() {
        const total = this.data.reduce((sum, value) => sum + value, 0);
        let currentAngle = -Math.PI / 2;

        this.data.forEach((value, i) => {
            const sliceAngle = (value / total) * (Math.PI * 2);
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.height / 2, currentAngle, currentAngle + sliceAngle);
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.fill();
            currentAngle += sliceAngle;
        });
    }
}

export class Legend {
    constructor(options) {
        this.container = document.getElementById(options.containerId);
        this.data = options.data || [];
        this.colors = options.colors || ['#3498db'];
    }

    draw() {
        this.data.forEach((label, i) => {
            const legendItem = document.createElement('div');
            const colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.backgroundColor = this.colors[i % this.colors.length];

            legendItem.appendChild(colorBox);
            legendItem.appendChild(document.createTextNode(` ${label}`));

            this.container.appendChild(legendItem);
        });
    }
}

export class Axis {
    constructor(options) {
        this.canvas = document.getElementById(options.id);
        this.ctx = this.canvas.getContext('2d');
        this.labels = options.labels || [];
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(50, 0);
        this.ctx.lineTo(50, this.canvas.height);
        this.ctx.moveTo(50, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.labels.forEach((label, i) => {
            const x = 50 + i * 60;
            this.ctx.fillText(label, x, this.canvas.height - 10);
        });
    }
}
