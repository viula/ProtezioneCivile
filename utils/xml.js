// File: xml.js
// Funzione per recuperare dati XML da un URL e restituirli come array di oggetti
// Parametri:
// - url: URL da cui recuperare i dati XML
// - paramList: lista dei parametri da estrarre dai nodi XML
// - rootTag: tag radice da cui estrarre i dati (opzionale)
// Restituisce un array di oggetti contenenti i dati estratti dai nodi XML
//
// Esempio di utilizzo:
// const data = await fetchXMLData("https://example.com/data.xml", ["id", "name"], "items");
// console.log(data); // Stampa l'array di oggetti con i parametri specificati

export async function fetchXMLData(url, paramList, rootTag = null) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'application/xml');

    const rootElements = rootTag ? [...xmlDoc.getElementsByTagName(rootTag)] : [xmlDoc.documentElement];

    return rootElements.map(root => {
        const result = {};
        for (const param of paramList) {
            const parts = param.split('/');
            let node = root;
            for (const part of parts) {
                node = node?.getElementsByTagName(part)?.[0];
                if (!node) break;
            }
            result[param] = node?.textContent || '';
        }
        return result;
    });
}

  