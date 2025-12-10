// script.js
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const searchBtn = document.getElementById('searchBtn');
const resultEl = document.getElementById('result');
const posterEl = document.getElementById('poster');
const animeTitleEl = document.getElementById('animeTitle');
const animeDataEl = document.getElementById('animeData');
const externalLinkEl = document.getElementById('externalLink');

let uploadedFile = null;

// Если клик по зоне — открываем проводник
uploadArea.addEventListener('click', () => fileInput.click());

// input change
fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files.length) {
    uploadedFile = fileInput.files[0];
    searchBtn.disabled = false;
  }
});

// утилита: читаем файл как dataURL
function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// <-- Заменить, если хочешь другой backend -->
const BASE_API = "https://animefinder-backend.vercel.app/api/search";
// ------------------------------------------------------------

searchBtn.addEventListener('click', async () => {
  if (!uploadedFile) return;

  searchBtn.textContent = 'Searching...';
  searchBtn.disabled = true;
  resultEl.style.display = 'none';

  try {
    const dataUrl = await readFileAsDataURL(uploadedFile);
    // чистый base64 без префикса
    const base64 = dataUrl.split(',')[1];

    const resp = await fetch(BASE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });

    if (!resp.ok) {
      // пробуем прочитать тело ошибки
      const text = await resp.text();
      console.error('Backend returned error', resp.status, text);
      alert('Server error: ' + resp.status + '\n' + (text || 'See console'));
      return;
    }

    const j = await resp.json();

    if (!j || !j.result || j.result.length === 0) {
      animeTitleEl.textContent = 'No matches found';
      animeDataEl.textContent = '';
      posterEl.src = '';
      externalLinkEl.href = '#';
      resultEl.style.display = 'block';
      return;
    }

    const best = j.result[0];

    posterEl.src = best.image || (best.anilist && (best.anilist.coverImage?.large || best.anilist.coverImage?.medium)) || 'https://placehold.co/200x300';
    const title = (best.anilist && (best.anilist.title?.english || best.anilist.title?.romaji)) || best.filename || 'Unknown';
    animeTitleEl.textContent = title;

    const episode = best.episode ?? '—';
    const at = best.from ? new Date(best.from * 1000).toISOString().substr(11, 8) : '';
    const similarity = best.similarity ? (best.similarity * 100).toFixed(1) + '%' : '';
    animeDataEl.textContent = `Episode ${episode} · ${at} · ${similarity}`;

    externalLinkEl.href = (best.anilist && ('https://anilist.co/anime/' + best.anilist.id)) || best.site || '#';
    externalLinkEl.target = '_blank';

    resultEl.style.display = 'block';
  } catch (err) {
    console.error('Search error:', err);
    alert('Ошибка при поиске. Смотри консоль.');
  } finally {
    searchBtn.textContent = 'Search Anime';
    searchBtn.disabled = false;
  }
});
