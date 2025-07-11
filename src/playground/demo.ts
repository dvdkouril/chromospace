import { addStructureToScene, ChromatinScene, display, initScene, loadFromURL } from "../main.ts";

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

  //const table = structure.data;
  //const chromColumn = table.getChild("chr")!.toArray() as string[];
  //const vc = {
  //  color: {
  //    values: chromColumn,
  //    colorScale: "viridis",
  //  },
  //};

  const vc = {
    color: {
      field: "chr", //~ uses the 'chr' column in the Arrow table that defines the structure
      colorScale: "spectral",
    }
  };

  chromatinScene = addStructureToScene(chromatinScene, structure, vc);

  return chromatinScene;
};

const setupChunkExample = async (): Promise<ChromatinScene> => {
  const urlStevensChrf = "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/Stevens-2017_GSM2219497_Cell_1_model_1_chr_f.arrow";

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


  //const viewConfig = {
  //  scale: 0.01,
  //  color: "lightgreen",
  //  links: false,
  //};
  //
  ////~ create a scene
  //let chromatinScene = initScene();
  //
  //for (let i = 0; i < 8; i++) {
  //  const randX = Math.random() - 0.5;
  //  const randY = Math.random() - 0.5;
  //  const randZ = Math.random() - 0.5;
  //  const randomPosition = vec3.fromValues(randX, randY, randZ);
  //  console.log(`adding chunk nr. ${i}`);
  //  if ("parts" in structure) {
  //    const testChunk = structure.parts[i].chunk;
  //    chromatinScene = addChunkToScene(chromatinScene, testChunk, {
  //      ...viewConfig,
  //      position: randomPosition,
  //    });
  //  }
  //}
  //
  //const [renderer, canvas] = display(chromatinScene, {
  //  alwaysRedraw: true,
  //  withHUD: true,
  //});
  //
  ////~ add canvas to the page
  //const appEl = document.querySelector("#app");
  //if (canvas && appEl) {
  //  appEl.appendChild(canvas);
  //}
  //
  //const elem = document.querySelector("#screenshot");
  //if (elem) {
  //  elem.addEventListener("click", () => {
  //    renderer.render();
  //    if (canvas instanceof HTMLCanvasElement) {
  //      canvas.toBlob((blob: Blob | null) => {
  //        saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
  //      });
  //    }
  //  });
  //}

  //const saveBlob = (() => {
  //  const a = document.createElement("a");
  //  document.body.appendChild(a);
  //  a.style.display = "none";
  //  return function saveData(blob: Blob | null, fileName: string) {
  //    if (blob) {
  //      const url = window.URL.createObjectURL(blob);
  //      a.href = url;
  //      a.download = fileName;
  //      a.click();
  //    }
  //  };
  //})();
})();
