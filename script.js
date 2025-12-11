const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const searchBtn = document.getElementById("searchBtn");

const resultBox = document.getElementById("result");
const poster = document.getElementById("poster");
const animeTitle = document.getElementById("animeTitle");
const animeData = document.getElementById("animeData");
const externalLink = document.getElementById("externalLink");

let selectedFile = null;

// === Upload click ===
uploadArea.addEventListener("click", () => fileInput.click());

// === When file selected ===
fileInput.addEventListener("change", () => {
  if (!fileInput.files || fileInput.files.length === 0) return;

  selectedFile = fileInput.files[0];

  uploadArea.innerHTML = `<span class="upload-text">Image selected ✓</span>`;
  searchBtn.disabled = false;  // активируем кнопку
});


// === SEARCH BUTTON ===
searchBtn.addEventListener("click", async () => {
    if (!selectedFile) {
        alert("Please upload an image first.");
        return;
    }

    searchBtn.textContent = "Searching...";
    searchBtn.disabled = true;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
        // ... внутри searchBtn.addEventListener ...

const response = await fetch("https://animefinder-backend.vercel.app/api/search", { // Твой URL
    method: "POST",
    body: selectedFile, // ВАЖНО: Для этого бэкенда отправляем файл напрямую, БЕЗ FormData!
    headers: {
        "Content-Type": selectedFile.type 
    }
});

const data = await response.json();
console.log("Trace.moe response:", data);

// Trace.moe возвращает объект: { result:Array, error:String }
if (!data.result || data.result.length === 0) {
    animeTitle.textContent = "No matches found";
    return;
}

const best = data.result[0]; // Лучшее совпадение

// === ОБНОВЛЕННЫЙ ПАРСИНГ ПОД TRACE.MOE ===

// 1. Название (Trace.moe с параметром ?anilistInfo возвращает данные из Anilist)
if (best.anilist && best.anilist.title) {
    animeTitle.textContent = best.anilist.title.english || best.anilist.title.romaji || "Unknown Title";
} else {
    animeTitle.textContent = best.filename;
}

// 2. Эпизод и время
const minutes = Math.floor(best.from / 60);
const seconds = Math.floor(best.from % 60);
animeData.textContent = `Episode: ${best.episode} | Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;

// 3. Картинка (превью кадра)
poster.src = best.image; // Trace.moe возвращает URL картинки в поле image

// 4. Видео (Trace.moe дает видео фрагмент!)
// Если у тебя есть <video> тег, можно вставить best.video

        // === External link ===
        if (best.data.ext_urls && best.data.ext_urls.length > 0) {
            externalLink.href = best.data.ext_urls[0];
            externalLink.style.display = "inline-block";
        } else {
            externalLink.style.display = "none";
        }

        resultBox.style.display = "block";

    } catch (e) {
        console.error("Fetch error:", e);
        alert("API request failed, check backend and CORS.");
    }

    searchBtn.textContent = "Search Anime";
    searchBtn.disabled = false;
});
