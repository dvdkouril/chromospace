import type { ChromatinModelViewConfig, MarkTypes } from "../chromatin-types";

import { parse3dg } from "../data-loaders/tsv-parser";
import { initScene, addModelToScene, display } from "../chromatin";
import { get } from "../selections";

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
  filter?: string;
  links: boolean;
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
export async function embed(spec: ChromospaceSchema): Promise<HTMLElement> {
  console.log("embedding spec:");
  console.log(spec);

  const tan2018Model = await fetchExampleWholeGenomeModel();

  let chromatinScene = initScene();
  for (const v of spec.views) {
    for (const t of v.tracks) {
      console.log(`Found track with mark: ${t.mark}`);

      const viewConfig: ChromatinModelViewConfig = { 
        binSizeScale: parseFloat(t.encoding.size) || 0.005, 
        coloring: "constant",
        color: t.encoding.color,
        mark: t.mark,
        makeLinks: t.links,
      };

      if (!tan2018Model) {
        continue;
      }

      if (t.filter) {
        const selectedPart = t.filter;
        const res = get(tan2018Model, selectedPart);
        if (!res) {
          continue;
        }
        const [selectedPartA, _] = res;
        const selectedModelA = {
          parts: [selectedPartA],
        };
        chromatinScene = addModelToScene(chromatinScene, selectedModelA, viewConfig);
      } else {
        chromatinScene = addModelToScene(chromatinScene, tan2018Model, viewConfig);
      }
    }
  }

  const [_, canvas] = display(chromatinScene, { alwaysRedraw: false});
  return canvas;
}
