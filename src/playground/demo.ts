import {
  addStructureToScene,
  ChromatinScene,
  display,
  initScene,
  loadFromURL,
} from "../main.ts";

const setupWholeGenomeExample = async (): Promise<ChromatinScene> => {
  const urlStevens =
    "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";

  let chromatinScene = initScene();

  const structure = await loadFromURL(urlStevens, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return chromatinScene;
  }
  console.log(`loaded structure: ${structure.name}`);

  const vc = {
    color: {
      field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
      colorScale: "spectral",
    },
  };

  chromatinScene = addStructureToScene(chromatinScene, structure, vc);

  return chromatinScene;
};

const setupChunkExample = async (): Promise<ChromatinScene> => {
  const urlStevensChrf =
    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/Stevens-2017_GSM2219497_Cell_1_model_1_chr_f.arrow";

  let chromatinScene = initScene();

  const structure = await loadFromURL(urlStevensChrf, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return chromatinScene;
  }
  console.log(`loaded structure: ${structure.name}`);

  const minVal = 0;
  const maxVal = structure.data.numRows;

  const vals = Array.from({ length: structure.data.numRows }, (_, i) => {
    return i;
  });

  const viewConfig = {
    // scale: 0.01,
    scale: {
      values: vals,
      min: minVal,
      max: maxVal,
      scaleMin: 0.005,
      scaleMax: 0.03,
    },
    color: {
      values: vals,
      min: minVal,
      max: maxVal,
      // colorScale: "spectral",
      colorScale: "Spectral",
    },
  };

  chromatinScene = addStructureToScene(chromatinScene, structure, viewConfig);

  return chromatinScene;
};

(async () => {
  const chromatinScene = await setupWholeGenomeExample();
  //const chromatinScene = await setupChunkExample();

  const [_, canvas] = display(chromatinScene, {
    alwaysRedraw: false,
    withHUD: false,
  });

  //~ add canvas to the page
  const appEl = document.querySelector("#app");
  if (canvas && appEl) {
    appEl.appendChild(canvas);
  }
})();
