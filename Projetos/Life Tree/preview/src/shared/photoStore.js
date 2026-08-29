// Armazenamento de fotos via IndexedDB — usado pelo recurso "Fotos de Progresso" do
// Geburah (e reutilizável por qualquer outro módulo que precise guardar imagens no
// futuro, via o parâmetro `collection`). Isolado atrás de savePhoto/getPhotos/deletePhoto
// de propósito: no dia em que o app virar nativo (React Native, ou o PWA empacotado via
// Capacitor), só este arquivo precisa trocar de implementação — o resto do app não sabe
// nem precisa saber que hoje isso é IndexedDB.
//
// Por que IndexedDB e não localStorage (o padrão usado no resto do app): localStorage
// tem limite de ~5-10MB por site, compartilhado com tudo que o app já guarda (hábitos,
// treinos, finanças...) — algumas dezenas de fotos já estourariam isso. IndexedDB tem
// uma cota muito maior (fração generosa do disco livre do dispositivo) e guarda binário
// direto, sem precisar inflar a imagem pra texto base64 antes.

const DB_NAME = "lifetree_photos";
const DB_VERSION = 1;
const STORE = "photos";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("collection", "collection", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Salva uma foto já comprimida (data URL) numa coleção lógica (ex: "geburah_progresso").
export async function savePhoto(collection, { data, date, tag }) {
  const db = await openDB();
  const id = collection + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const record = { id, collection, data, date, tag: tag || "", ts: Date.now() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

// Lista as fotos de uma coleção, ordenadas por data.
export async function getPhotos(collection) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).index("collection").getAll(collection);
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => a.date.localeCompare(b.date)));
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Redimensiona e comprime uma imagem (File do <input type=file>) via <canvas> antes de
// guardar — sem isso, uma foto de celular moderno (vários MB) esgota a cota rápido.
// Retorna um data URL JPEG.
export function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
