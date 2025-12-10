document.getElementById("imageInput").addEventListener("change", function () {
    const preview = document.getElementById("preview");
    const file = this.files[0];

    if (!file) {
        preview.style.display = "none";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

document.getElementById("searchForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload an image first");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Searching…</p>";

    try {
        const response = await fetch("https://animefinder-backend.vercel.app/api/search", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend returned error", data);
            resultsDiv.innerHTML = `<p class="error">Error: ${data.error || "Unknown server error"}</p>`;
            return;
        }

        if (!data || !data.result || data.result.length === 0) {
            resultsDiv.innerHTML = "<p>No matches found.</p>";
            return;
        }

        // render results
        resultsDiv.innerHTML = "";
        data.result.forEach(item => {
            const el = document.createElement("div");
            el.className = "result-item";

            el.innerHTML = `
                <img src="${item.image}" alt="preview">
                <div class="info">
                    <h3>${item.filename}</h3>
                    <p>Episode: ${item.episode}</p>
                    <p>Similarity: ${(item.similarity * 100).toFixed(2)}%</p>
                </div>
            `;

            resultsDiv.appendChild(el);
        });

    } catch (err) {
        console.error("Frontend error:", err);
        resultsDiv.innerHTML = `<p class="error">Request failed. Check console.</p>`;
    }
});
