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
        const response = await fetch("https://animefinder-backend.vercel.app/api/search", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("SauceNAO response:", data);

        // === If error OR no results ===
        if (!data.results || data.results.length === 0) {
            animeTitle.textContent = "No matches found";
            animeData.textContent = "";
            poster.src = "";
            externalLink.style.display = "none";
            resultBox.style.display = "block";
            searchBtn.textContent = "Search Anime";
            searchBtn.disabled = false;
            return;
        }

        const best = data.results[0];

        // === TITLE ===
        animeTitle.textContent =
            best.data.title ||
            best.data.title_romaji ||
            best.data.title_english ||
            "Unknown anime";

        // === OTHER INFO (optional) ===
        animeData.textContent =
            best.data.source ||
            best.data.part ||
            best.data.est_time ||
            "";

        // === Thumbnail ===
        poster.src = best.header.thumbnail || "";

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
