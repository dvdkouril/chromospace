import type { ChromatinModelViewConfig, MarkTypes } from "../chromatin-types";

import { parse3dg } from "../data-loaders/tsv-parser";
import { initScene, addModelToScene, display } from "../chromatin";

type ChromospaceSchema = {
  views: ChsView[];
};

type ChsView = {
  data: string;
  tracks: ChsTrack[];
};

type ChsTrack = {
  mark: MarkTypes;
  encoding: {
    position: string;
    color: string;
    size: string;
  };
};

async function fetchExampleWholeGenomeModel() {
  const urlTan2018 = "https://dl.dropboxusercontent.com/scl/fi/lzv3ba5paum6srhte4z2t/GSM3271406_pbmc_18.impute.3dg.txt?rlkey=dc7k1gg5ghv2v7dsl0gg1uoo9&dl=0";
  const response = await fetch(urlTan2018);
  const fileText = await response.text();
  const tan2018Model = parse3dg(fileText , { center: true, normalize: true }); //~ parseTsv(data, center = true) ? 
  return tan2018Model;
}

/**
 * Embedding a visualization specified in a declarative manner into a web page.
 */
export function embed(spec: ChromospaceSchema): HTMLElement {
  console.log("embedding spec:");
  console.log(spec);
  // return spec;

  const container = document.createElement("div");

  const tan2018Model = await fetchExampleWholeGenomeModel();

  let chromatinScene = initScene();
  for (const v of spec.views) {
    for (const t of v.tracks) {
      const p = document.createElement("p");
      p.innerText = `Found track with mark: ${t.mark}`;
      container.appendChild(p);

      // encoding: {
      //   position: string;
      //   color: string;
      //   size: string;
      // };

      const viewConfig: ChromatinModelViewConfig = { 
        binSizeScale: parseFloat(t.encoding.size) || 0.005, 
        coloring: "constant",
        mark: t.mark,
      };

      if (tan2018Model) {
        chromatinScene = addModelToScene(chromatinScene, tan2018Model, viewConfig);
      } else {
        console.log("tan2018Model is undefined");
      }
    }
  }

  const [_, canvas] = display(chromatinScene, { alwaysRedraw: false});
  return canvas;
  // return container;
}

// const vegaExample = `
// {
//   "data": {"url": "data/seattle-weather.csv"},
//   "mark": "bar",
//   "encoding": {
//     "x": {
//       "timeUnit": "month",
//       "field": "date",
//       "type": "ordinal"
//     },
//     "y": {
//       "aggregate": "mean",
//       "field": "precipitation"
//     }
//   }
// }`;

// const spec = `
// {
//     "views": [
//         {
//             "data": "test.xyz",
//             "tracks": [
//                 {
//                     "filter": "chr1:10000-20000",
//                     "mark": "sphere",
//                 },
//                 {
//                     "filter": "chr2",
//                     "mark": "box",
//                 },
//             ],
//         },
//     ]
// }
// `;
// console.log(spec);
// const specJson = JSON.parse(spec);
// const specTyped = specJson as ChromospaceSchema;
// console.log(specTyped);

// const testSpec = {
//     views: [
//         {
//             data: "no data added",
//             tracks: [
//                 {
//                     mark: "box",
//                 }
//             ],
//         }
//     ]
// };
// console.log(testSpec);
