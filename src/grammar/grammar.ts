import type { MarkTypes } from "../chromatin-types";

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

/**
 * Embedding a visualization specified in a declarative manner into a web page.
 */
export function embed(spec: ChromospaceSchema): HTMLElement {
  console.log("embedding spec:");
  console.log(spec);
  // return spec;

  const container = document.createElement("div");

  for (const v of spec.views) {
    for (const t of v.tracks) {
      const p = document.createElement("p");
      p.innerText = `Found track with mark: ${t.mark}`;
      container.appendChild(p);
    }
  }

  // const canvas = document.createElement('pre');
  // canvas.innerText = "[insert visualization here]";
  // return canvas;
  return container;
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
