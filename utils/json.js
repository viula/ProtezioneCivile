// File: json.js
// Funzione per recuperare dati JSON da un URL e restituirli come array di oggetti
// Parametri:
// - url: URL da cui recuperare i dati JSON
// - paramList: lista dei parametri da estrarre dagli oggetti JSON
// - rootPath: percorso radice da cui estrarre i dati (opzionale)
// Restituisce un array di oggetti contenenti i dati estratti dagli oggetti JSON
//
// Esempio di utilizzo:
// const data = await fetchJSONData("https://example.com/data.json", ["id", "name"], "items");
// console.log(data); // Stampa l'array di oggetti con i parametri specificati


export async function fetchJSONData(url, paramList = [], rootPath = null) {
    try {
      const response = await fetch(url);
      const jsonData = await response.json();
  
      const items = rootPath
        ? rootPath.split('.').reduce((obj, key) => obj?.[key], jsonData)
        : jsonData;
  
      if (!Array.isArray(items)) throw new Error("Root path does not resolve to an array");
  
      const data = items.map(item => {
        let result = {};
        paramList.forEach(param => {
          result[param] = item.hasOwnProperty(param) ? item[param] : null;
        });
        return result;
      });
  
      return data;
    } catch (error) {
      console.error("Errore nel recupero dei dati JSON:", error);
      return [];
    }
  }
  