const fileInput = document.getElementById("fileInput");
const searchBtn = document.getElementById("searchBtn");
const resultEl = document.getElementById("result");
const posterEl = document.getElementById("poster");
const animeTitleEl = document.getElementById("animeTitle");
const animeDataEl = document.getElementById("animeData");
const externalLinkEl = document.getElementById("externalLink");

let uploadedFile = null;

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    uploadedFile = fileInput.files[0];
    searchBtn.disabled = false;
  }
});

// Загружаем картинку на imgbb → получаем URL → отправляем в trace.moe
async function uploadToImgbb(file) {
  const API_KEY = "eb6002b5f8d3e3f209833e690ea0684d"; // рабочий ключ

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
    method: "POST",
    body: form
  });

  const json = await res.json();

  if (!json.success) throw new Error("imgbb upload failed");

  return json.data.url;
}

searchBtn.addEventListener("click", async () => {
  if (!uploadedFile) return;

  searchBtn.textContent = "Searching...";
  searchBtn.disabled = true;

  try {
    // 1) Загружаем файл на imgbb
    const imageUrl = await uploadToImgbb(uploadedFile);

    // 2) Отправляем URL напрямую в trace.moe
    const apiURL = `https://api.trace.moe/search?url=${encodeURIComponent(imageUrl)}`;

    const resp = await fetch(apiURL);
    const data = await resp.json();

    if (!data.result || data.result.length === 0) {
      animeTitleEl.textContent = "No matches found";
      animeDataEl.textContent = "";
      posterEl.src = "";
      externalLinkEl.href = "#";
      resultEl.style.display = "block";
      return;
    }

    const best = data.result[0];

    posterEl.src = best.image;
    animeTitleEl.textContent =
      best.anilist?.title?.english ||
      best.anilist?.title?.romaji ||
      "Unknown";

    animeDataEl.textContent =
      `Episode: ${best.episode ?? "?"} · ${Math.round(best.similarity * 100)}% match`;

    externalLinkEl.href = `https://anilist.co/anime/${best.anilist.id}`;
    externalLinkEl.target = "_blank";

    resultEl.style.display = "block";

  } catch (err) {
    alert("Search error: " + err.message);
    console.error(err);
  }

  searchBtn.textContent = "Search Anime";
  searchBtn.disabled = false;
});
