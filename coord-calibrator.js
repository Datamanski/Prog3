const baseMapWidth = 982;

const coords = {
    "entrance0": { x: 308, y: 69 },
    "entrance1": { x: 89, y: 333 },
    "entrance2": { x: 897, y: 429 },
    "entrance3": { x: 566, y: 817 },
    "entrance4": { x: 688, y: 902 },
    "general-gate0": { x: 541, y: 49 },
    "general-gate1": { x: 318, y: 127 },
    "general-gate2": { x: 512, y: 161 },
    "general-gate3": { x: 912, y: 273 },
    "general-gate4": { x: 340, y: 482 },
    "general-gate5": { x: 609, y: 546 },
    "general-gate6": { x: 667, y: 673 },
    "general-gate7": { x: 322, y: 707 },
    "ranger-stop0": { x: 439, y: 84 },
    "ranger-stop1": { x: 98, y: 120 },
    "ranger-stop2": { x: 395, y: 175 },
    "ranger-stop3": { x: 725, y: 224 },
    "ranger-stop4": { x: 94, y: 467 },
    "ranger-stop5": { x: 741, y: 581 },
    "ranger-stop6": { x: 606, y: 722 },
    "ranger-stop7": { x: 494, y: 746 },
    "ranger-base": { x: 629, y: 858 },
    "camping0": { x: 258, y: 204 },
    "camping1": { x: 635, y: 249 },
    "camping2": { x: 221, y: 317 },
    "camping3": { x: 225, y: 339 },
    "camping4": { x: 239, y: 440 },
    "camping5": { x: 102, y: 594 },
    "camping6": { x: 735, y: 867 },
    "camping7": { x: 888, y: 712 },
    "camping8": { x: 897, y: 238 },
    "gate0": { x: 313, y: 165 },
    "gate1": { x: 286, y: 220 },
    "gate2": { x: 122, y: 270 },
    "gate3": { x: 731, y: 297 },
    "gate4": { x: 806, y: 561 },
    "gate5": { x: 644, y: 716 },
    "gate6": { x: 572, y: 740 },
    "gate7": { x: 477, y: 786 },
    "gate8": { x: 677, y: 887 }
};

const pointNames = Object.keys(coords);
const updatedCoords = {};
let currentIndex = 0;

const currentPointName = document.getElementById("currentPointName");
const progressText = document.getElementById("progressText");
const oldCoordText = document.getElementById("oldCoordText");
const newCoordText = document.getElementById("newCoordText");
const statusText = document.getElementById("statusText");
const pointList = document.getElementById("pointList");
const exportBox = document.getElementById("exportBox");
const mapImage = document.getElementById("mapImage");
const mapOverlay = document.getElementById("mapOverlay");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const skipBtn = document.getElementById("skipBtn");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");

function getCurrentName() {
    return pointNames[currentIndex];
}

function getDisplayScale() {
    return mapImage.clientWidth / baseMapWidth || 1;
}

function getNewOrOriginalPoint(name) {
    return updatedCoords[name] || coords[name];
}

function moveToNextPoint() {
    if (currentIndex < pointNames.length - 1) {
        currentIndex += 1;
    }
}

function setStatus(message) {
    statusText.textContent = message;
}

function clearMarkers() {
    mapOverlay.querySelectorAll(".marker").forEach(marker => marker.remove());
}

function addMarker(className, point) {
    const scale = getDisplayScale();
    const marker = document.createElement("div");

    marker.className = `marker ${className}`;
    marker.style.left = `${point.x * scale}px`;
    marker.style.top = `${point.y * scale}px`;
    mapOverlay.appendChild(marker);
}

function renderMarkers() {
    const name = getCurrentName();
    clearMarkers();
    addMarker("old", coords[name]);

    if (updatedCoords[name]) {
        addMarker("new", updatedCoords[name]);
    }

    addMarker("active", getNewOrOriginalPoint(name));
}

function renderPointList() {
    pointList.innerHTML = "";

    pointNames.forEach((name, index) => {
        const item = document.createElement("div");
        const label = document.createElement("div");
        const button = document.createElement("button");

        item.className = "point-item";
        if (index === currentIndex) item.classList.add("active");
        if (updatedCoords[name]) item.classList.add("done");

        label.textContent = `${index + 1}. ${name}`;

        button.type = "button";
        button.className = "secondary";
        button.textContent = "Jump";
        button.addEventListener("click", () => {
            currentIndex = index;
            setStatus("");
            render();
        });

        item.appendChild(label);
        item.appendChild(button);
        pointList.appendChild(item);
    });
}

function generateExportText() {
    const lines = pointNames.map(name => {
        const point = getNewOrOriginalPoint(name);
        return `    "${name}": { x: ${point.x} * scale, y: ${point.y} * scale }`;
    });

    return `const coords = {\n${lines.join(",\n")}\n};`;
}

function renderExport() {
    exportBox.value = generateExportText();
}

function render() {
    const name = getCurrentName();
    const original = coords[name];
    const replacement = updatedCoords[name];
    const completedCount = Object.keys(updatedCoords).length;

    currentPointName.textContent = name;
    progressText.textContent = `Point ${currentIndex + 1} of ${pointNames.length} - ${completedCount} updated`;
    oldCoordText.textContent = `(${original.x}, ${original.y})`;
    newCoordText.textContent = replacement ? `(${replacement.x}, ${replacement.y})` : "Not set";
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === pointNames.length - 1;

    renderMarkers();
    renderPointList();
    renderExport();
}

function saveCurrentPoint(event) {
    const rect = mapImage.getBoundingClientRect();
    const scale = getDisplayScale();
    const name = getCurrentName();
    const x = Math.round((event.clientX - rect.left) / scale);
    const y = Math.round((event.clientY - rect.top) / scale);

    updatedCoords[name] = { x, y };
    setStatus(`Saved ${name} at (${x}, ${y}).`);
    moveToNextPoint();
    render();
}

function copyExportText() {
    navigator.clipboard.writeText(exportBox.value)
        .then(() => setStatus("Copied updated coords object to clipboard."))
        .catch(() => {
            exportBox.select();
            setStatus("Clipboard copy failed, but the export text is selected.");
        });
}

mapOverlay.addEventListener("click", saveCurrentPoint);

prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex -= 1;
        setStatus("");
        render();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < pointNames.length - 1) {
        currentIndex += 1;
        setStatus("");
        render();
    }
});

skipBtn.addEventListener("click", () => {
    const name = getCurrentName();
    updatedCoords[name] = { ...coords[name] };
    setStatus(`Kept original coordinate for ${name}.`);
    moveToNextPoint();
    render();
});

copyBtn.addEventListener("click", copyExportText);

resetBtn.addEventListener("click", () => {
    Object.keys(updatedCoords).forEach(name => delete updatedCoords[name]);
    currentIndex = 0;
    setStatus("Cleared all replacement coordinates.");
    render();
});

window.addEventListener("resize", render);

if (mapImage.complete) {
    render();
} else {
    mapImage.addEventListener("load", render, { once: true });
}
