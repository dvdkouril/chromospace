import type { Color as ChromaColor, Scale as ChromaScale } from "chroma-js";
import chroma from "chroma-js";
import { vec3 } from "gl-matrix";
import type { Color } from "three";
import type {
  ChromatinChunk,
  ChromatinModelViewConfig,
} from "./chromatin-types";

//~ https://gka.github.io/chroma.js/#cubehelix
export const customCubeHelix = chroma
  .cubehelix()
  .start(200)
  .rotations(-0.8)
  .gamma(0.8)
  .lightness([0.3, 0.8]);

export const defaultColorScale = chroma.scale([
  "white",
  "rgba(245,166,35,1.0)",
  "rgba(208,2,27,1.0)",
  "black",
]);

export const flattenAllBins = (parts: ChromatinChunk[]): vec3[] => {
  const allBins: vec3[] = parts.reduce((acc: vec3[], curr: ChromatinChunk) => {
    return acc.concat(curr.bins);
  }, []);
  return allBins;
};

export const estimateBestSphereSize = (bins: vec3[]): number => {
  if (bins.length < 2) {
    return 1.0;
  }

  const distances: number[] = [];
  for (let i = 0; i < bins.length - 1; i++) {
    const curr = bins[i];
    const next = bins[i + 1];
    const dist = vec3.distance(curr, next);
    distances.push(dist);
  }
  const minDist = Math.min(...distances);

  //~ TODO: maybe something more sophisticated like in chromoskein: https://github.com/chromoskein/chromoskein/blob/196cc28821924965392f37a1921c9aa2ee7ffeff/app/src/components/RightPanel/ChromatinViewportConfigurationPanel.tsx#L262
  return 0.4 * minDist;
};

export const decideColor = (
  outColor: Color,
  i: number,
  n: number,
  color?: ChromaColor,
  colorMap?: ChromaScale,
) => {
  if (colorMap) {
    const u = i / n;
    const col = colorMap(u);
    outColor.set(col.hex());
  } else if (color) {
    outColor.set(color.hex());
  } else {
    outColor.set(chroma.random().hex());
  }
};

/* Returns visual attributes of i-th bin (out on n) based on config */
/* Correction: this is not the i-th bin, but i-th part in a model */
export function decideVisualParameters(
  viewConfig: ChromatinModelViewConfig,
  i: number,
  n: number,
): [ChromaColor | undefined, ChromaScale | undefined, number] {
  let color: ChromaColor | undefined = undefined;
  let scale: ChromaScale | undefined = undefined;
  const defaultSize = 0.008;
  const size = viewConfig.binSizeScale || defaultSize;

  const needColorsN = n;
  const chunkColors = customCubeHelix.scale().colors(needColorsN, null);

  if (viewConfig.coloring === "constant") {
    color = chunkColors[i];
    if (viewConfig.color) {
      color = chroma(viewConfig.color);
    }
  } else if (viewConfig.coloring === "scale") {
    color = undefined;
    scale = defaultColorScale;
  }

  return [color, scale, size];
}

/*
 * Utility function for converting genomic coordinate (i.e., nucleobase position) to bin index, given certain resolution
 * --------
 * Example:
 * resolution: 10bp
 * positions: 0123456789...         *
 * sequence:  TCTGCGGAGCACTCTGGTAATGCATATGGTCCACAGGACATTCGTCGCTT
 * bins:      ____0_____----1-----||||2|||||xxxx3xxxxx****4*****
 * coordinateToBin(22, 10) -> 2
 */
export function coordinateToBin(
  coordinate: number,
  resolution: number,
  sequenceOffset?: number,
): number {
  if (!sequenceOffset) {
    sequenceOffset = 0;
  }
  return Math.floor((coordinate - sequenceOffset) / resolution);
}
