import { addModelToScene, display, initScene, loadFromURL } from "../main.ts";

(async () => {
  const urlStevens =
    "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";
  const structure = await loadFromURL(urlStevens, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return;
  }

  const viewConfig = {
    scale: 0.005,
    color: "lightgreen",
  };

  //~ create a scene
  let chromatinScene = initScene();
  if ("parts" in structure) {
    chromatinScene = addModelToScene(chromatinScene, structure, viewConfig);
  }

  const [_, canvas] = display(chromatinScene, {
    alwaysRedraw: true,
    withHUD: false,
  });

  //~ add canvas to the page
  const appEl = document.querySelector("#app");
  if (canvas && appEl) {
    appEl.appendChild(canvas);
  }

})();

const appEl = document.querySelector<HTMLElement>("#app");
if (appEl) {
  const colorInput = document.createElement("input");
  appEl.appendChild(colorInput);
  colorInput.placeholder = "red";
  colorInput.addEventListener("input", (ev) => {
    const target = ev.target as HTMLInputElement;
    if (target && target.value) {
      const newColor = target.value;
      console.log(`newColor: ${newColor}`);
      //~ Big TODO: update the `color` in the viewconfig
      // probably something like:
      // viewConfig = {...viewConfig, color: newColor};
      // renderer.updateViewConfig(viewConfig);
    }
  });
}

