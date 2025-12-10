const fileInput = document.getElementById('fileInput');
const searchBtn = document.getElementById('searchBtn');
const resultEl = document.getElementById('result');
const posterEl = document.getElementById('poster');
const animeTitleEl = document.getElementById('animeTitle');
const animeDataEl = document.getElementById('animeData');
const externalLinkEl = document.getElementById('externalLink');

let uploadedFile = null;

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    uploadedFile = fileInput.files[0];
    searchBtn.disabled = false;
  }
});

async function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(",")[1]);
    reader.onerror = (err) => rej(err);
    reader.readAsDataURL(file);
  });
}

searchBtn.addEventListener('click', async () => {
  if (!uploadedFile) return;

  searchBtn.textContent = "Searching...";
  searchBtn.disabled = true;

  try {
    const base64 = await toBase64(uploadedFile);

    const BASE_API = "https://animefinder-backend.vercel.app/api/search";

    const resp = await fetch(BASE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 })
    });

    const data = await resp.json();

    console.log("SauceNAO response:", data);

    if (!data.results || data.results.length === 0) {
      animeTitleEl.textContent = "No matches found";
      animeDataEl.textContent = "";
      posterEl.src = "";
      externalLinkEl.href = "#";
      resultEl.style.display = "block";
      return;
    }

    const best = data.results[0];

    // выбираем лучший заголовок
    const title =
      best.data.title ||
      best.data.source ||
      best.data.jp_name ||
      "Unknown title";

    animeTitleEl.textContent = title;

    // постер
    posterEl.src = best.header.thumbnail || "https://placehold.co/200x300";

    // похожесть
    animeDataEl.textContent = `Similarity: ${best.header.similarity}%`;

    // ссылка если есть
    if (best.data.ext_urls && best.data.ext_urls.length > 0) {
      externalLinkEl.href = best.data.ext_urls[0];
    } else {
      externalLinkEl.href = "#";
    }

    externalLinkEl.target = "_blank";
    resultEl.style.display = "block";

  } catch (err) {
    alert("Ошибка: " + err.message);
    console.error(err);
  } finally {
    searchBtn.textContent = "Search Anime";
    searchBtn.disabled = false;
  }
});
