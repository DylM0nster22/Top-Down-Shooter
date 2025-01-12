class SkinSelector {
    constructor() {
        this.selectedSkin = localStorage.getItem("selectedSkin") || "default";
        this.availableSkins = [
            { id: "triangle", shape: "triangle" },
            { id: "diamond", shape: "diamond" },
            { id: "hexagon", shape: "hexagon" },
        ];
    }

    selectSkin(skinId) {
        this.selectedSkin = skinId;
        localStorage.setItem("selectedSkin", skinId);
    }

    renderSkinSelector(container) {
        const skinSelector = document.createElement("div");
        skinSelector.className = "skin-selector";

        this.availableSkins.forEach(skin => {
            const skinOption = document.createElement("div");
            skinOption.className = `skin-option ${skin.shape}`;
            skinOption.dataset.skinId = skin.id;
            skinOption.addEventListener("click", () => this.selectSkin(skin.id));
            skinSelector.appendChild(skinOption);
        });

        container.appendChild(skinSelector);
    }
}

export default SkinSelector;
