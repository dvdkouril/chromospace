import { addChunkToScene, initScene, display, loadFromURL } from './main.ts';
import { vec3 } from "gl-matrix";

(async () => {
  const urlStevens = "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Stevens-2017_GSM2219497_Cell_1_model_5.arrow";
  let structure = await loadFromURL(urlStevens, {
    center: true,
    normalize: true,
  });
  if (!structure) {
    console.warn("unable to load structure from URL!");
    return;
  }

  const viewConfig = ({
    scale: 0.01,
    color: "lightgreen",
    links: false,
  });

  //~ create a scene
  let chromatinScene = initScene();


  for (let i = 0; i < 8; i++) {
    const randX = Math.random() - 0.5;
    const randY = Math.random() - 0.5;
    const randZ = Math.random() - 0.5;
    const randomPosition = vec3.fromValues(randX, randY, randZ);
    console.log("adding chunk nr. " + i);
    if ("parts" in structure) {
      const testChunk = structure.parts[i].chunk;
      chromatinScene = addChunkToScene(chromatinScene, testChunk,
        {
          ...viewConfig,
          position: randomPosition
        });
    }
  }

  const [renderer, canvas] = display(chromatinScene, { alwaysRedraw: true, withHUD: true });

  //~ add canvas to the page
  let appEl = document.querySelector('#app');
  if (canvas && appEl) {
    appEl.appendChild(canvas);
  }

  const elem = document.querySelector('#screenshot');
  if (elem) {
    elem.addEventListener('click', () => {
      renderer.render();
      if (canvas instanceof HTMLCanvasElement) {
        canvas.toBlob((blob: Blob | null) => {
          saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
        });
      }
    });
  }

  const saveBlob = (function() {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    return function saveData(blob: Blob | null, fileName: string) {
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
      }
    };
  }());

})();
