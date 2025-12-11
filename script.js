// script.js — полная версия (замени существующий файл полностью)

// --- Найти элементы в DOM (робастно) ---
const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea"); // может быть undefined, но обычно есть
const searchBtn = document.getElementById("searchBtn");
const resultEl = document.getElementById("result");
const posterEl = document.getElementById("poster");
const animeTitleEl = document.getElementById("animeTitle");
const animeDataEl = document.getElementById("animeData");
const externalLinkEl = document.getElementById("externalLink");

// Если чего-то нет — логируем, но скрипт не упадёт
if (!fileInput) console.warn("fileInput not found in DOM");
if (!searchBtn) console.warn("searchBtn not found in DOM");
if (!uploadArea) console.warn("uploadArea not found in DOM");
if (!resultEl) console.warn("resultEl not found in DOM");

// --- Переменные состояния ---
let uploadedFile = null;

// --- Утилиты ---
function enableBtn() {
  if (searchBtn) searchBtn.disabled = false;
}
function disableBtn() {
  if (searchBtn) searchBtn.disabled = true;
}

// читаем файл в dataURL
function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// визуально показать результат
function showResult({ image, title, info, link }) {
  if (!resultEl) return;
  if (posterEl) posterEl.src = image || "";
  if (animeTitleEl) animeTitleEl.textContent = title || "Unknown";
  if (animeDataEl) animeDataEl.textContent = info || "";
  if (externalLinkEl) {
    externalLinkEl.href = link || "#";
    externalLinkEl.target = "_blank";
  }
  resultEl.style.display = "block";
}

// скрыть результат
function hideResult() {
  if (!resultEl) return;
  resultEl.style.display = "none";
}

// --- Обработчики выбора файла ---
// клик по зоне — открываем проводник
if (uploadArea && fileInput) {
  uploadArea.addEventListener("click", () => fileInput.click());
}

// drag & drop (опционально, удобнее для юзеров)
if (uploadArea) {
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList?.add("dragover");
  });
  uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadArea.classList?.remove("dragover");
  });
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      uploadedFile = f;
      enableBtn();
      // сброс value не делаем здесь; change не вызывается — но файл сохранён
    }
  });
}

// input change — устанавливаем файл и сбрасываем value чтобы можно было выбрать тот же файл снова
if (fileInput) {
  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files.length) {
      uploadedFile = fileInput.files[0];
      enableBtn();
      // Сбрасываем value чтобы выбор того же файла снова сработал
      fileInput.value = "";
    }
  });
}

// --- Основной flow: поиск через backend (вариант 2) ---
// Замените BASE_API на ваш развернутый backend URL (Vercel), например:
// const BASE_API = "https://your-backend.vercel.app/api/search";
const BASE_API = "https://animefinder-backend.vercel.app/api/search"; // <--- замените если нужно

async function doSearch_viaBackend(file) {
  // читаем как dataURL, затем отправляем чистый base64 (или data URL — зависит от backend)
  const dataUrl = await readFileAsDataURL(file);
  const base64 = dataUrl.split(",")[1]; // голый base64

  // отправляем на backend
  const resp = await fetch(BASE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 })
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Backend returned ${resp.status} ${text}`);
  }

  const json = await resp.json();
  return json;
}

// --- (Опционально) Вариант без backend через imgbb/catbox + trace.moe
// Я оставляю здесь заготовку, но большинство upload-провайдеров блокируют CORS,
// поэтому этот путь может НЕ работать напрямую из браузера.
//
// async function uploadToCatbox(file) { ... }
// async function uploadToImgbb(file) { ... }
// async function doSearch_viaUploadThenTrace(file) { ... }

// --- Нажатие кнопки Search ---
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    if (!uploadedFile) return;
    hideResult();
    disableBtn();
    searchBtn.textContent = "Searching...";

    try {
      // --------------- ВЫЗОВ BACKEND (вариант 2) ---------------
      const json = await doSearch_viaBackend(uploadedFile);

      // trace.moe возвращает массив result
      if (!json || !json.result || json.result.length === 0) {
        showResult({ title: "No matches found", info: "", image: "", link: "#" });
      } else {
        const best = json.result[0];
        const title = (best.anilist && (best.anilist.title?.english || best.anilist.title?.romaji)) || best.filename || "Unknown";
        const time = best.from ? new Date(best.from * 1000).toISOString().substr(11,8) : "";
        const similarity = best.similarity ? (best.similarity * 100).toFixed(3) : "";
        const info = `Episode ${best.episode ?? "?"} · ${time} · ${similarity}`;
        const poster = best.image || (best.anilist && (best.anilist.coverImage?.large || best.anilist.coverImage?.medium)) || "";
        const link = (best.anilist && ("https://anilist.co/anime/" + best.anilist.id)) || best.site || "#";

        showResult({ image: poster, title, info, link });
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Ошибка при поиске: " + (err.message || err));
    } finally {
      searchBtn.textContent = "Search Anime";
      enableBtn();
    }
  });
}

// --- Полезная подсказка для отладки ---
// Если ты тестируешь и не уверен что файл script.js обновился на Pages,
// открой https://raw.githubusercontent.com/<user>/<repo>/main/script.js
// и сверяй содержимое. Также используй query param в index.html:
// <script src="script.js?v=2"></script> чтобы ломать кэш.
