// === Chargement du JSON ===
fetch("JSON/Buildings.json")
    .then(response => response.json())
    .then(data => generateBuildings(data))
    .catch(err => console.error("Erreur JSON:", err));

function generateBuildings(json) {
    const container = document.getElementById("generated-sections");
    if (!container) return;

    json.sections.forEach(section => {
        
        // --- Section Title ---
        const sectionDiv = document.createElement("div");
        sectionDiv.classList.add("section");

        const title = document.createElement("h2");
        title.classList.add("section-title");
        title.id = section.id;
        title.textContent = section.title;

        const content = document.createElement("div");
        content.classList.add("section-content");

        // --- Buildings inside the section ---
        section.buildings.forEach(building => {

            const panel = document.createElement("div");
            panel.classList.add("building-panel");

            // Image
            const img = document.createElement("img");
            img.classList.add("building-image");
            img.src = building.image;
            img.onerror = () => {
                img.src = "IMG/no-image.png";
            };

            // Info container
            const info = document.createElement("div");
            info.classList.add("building-info");

            // Name
            const name = document.createElement("h3");
            name.classList.add("building-name");
            name.textContent = building.name;

            // Description
            const desc = document.createElement("p");
            desc.classList.add("building-description");
            desc.textContent = building.description;

            info.appendChild(name);
            info.appendChild(desc);

            panel.appendChild(img);
            panel.appendChild(info);

            content.appendChild(panel);
        });

        sectionDiv.appendChild(title);
        sectionDiv.appendChild(content);

        container.appendChild(sectionDiv);
    });
}
