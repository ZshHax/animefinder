const fileInput = document.getElementById('fileInput');
const searchBtn = document.getElementById('searchBtn');

let uploadedFile = null;

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    uploadedFile = fileInput.files[0];
    searchBtn.disabled = false;
  }
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const API = "https://animefinder-backend.vercel.app/api/search";

searchBtn.addEventListener('click', async () => {
  if (!uploadedFile) return;

  searchBtn.textContent = "Searching...";
  searchBtn.disabled = true;

  try {
    const dataUrl = await readFileAsDataURL(uploadedFile);

    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl })
    });

    const json = await resp.json();

    if (!resp.ok) {
      alert("Server error " + resp.status + ":\n" + JSON.stringify(json));
      console.error(json);
      return;
    }

    console.log("RESULT:", json);
    alert("FOUND!\n" + JSON.stringify(json, null, 2));

  } catch (e) {
    console.error(e);
    alert("Failed: " + e.message);
  }

  searchBtn.textContent = "Search Anime";
  searchBtn.disabled = false;
});
