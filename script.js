searchBtn.addEventListener("click", async () => {
  if (!uploadedFile) return;

  searchBtn.textContent = "Searching...";
  searchBtn.disabled = true;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = reader.result.split(",")[1];

    try {
      const resp = await fetch("https://animefinder-backend.vercel.app/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: base64 })
      });

      const data = await resp.json();

      if (!data.result || data.result.length === 0) {
        animeTitleEl.textContent = "Not found";
        resultEl.style.display = "block";
        return;
      }

      const best = data.result[0];

      posterEl.src = best.image;
      animeTitleEl.textContent =
        best.anilist.title.english ||
        best.anilist.title.romaji ||
        "Unknown";

      animeDataEl.textContent =
        `Episode ${best.episode} · ${Math.round(best.similarity * 100)}% match`;

      externalLinkEl.href = `https://anilist.co/anime/${best.anilist.id}`;
      resultEl.style.display = "block";

    } catch (err) {
      alert("Error: " + err.message);
    }

    searchBtn.textContent = "Search Anime";
    searchBtn.disabled = false;
  };

  reader.readAsDataURL(uploadedFile);
});
