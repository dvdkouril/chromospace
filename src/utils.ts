import type { Color as ChromaColor, Scale as ChromaScale } from "chroma-js";
import chroma from "chroma-js";
import { vec3 } from "gl-matrix";
import { Color } from "three";
import type { DrawableMarkSegment } from "./renderer/renderer-types";

//~ https://gka.github.io/chroma.js/#cubehelix
export const customCubeHelix = chroma
  .cubehelix()
  .start(200)
  .rotations(-0.8)
  .gamma(0.8)
  .lightness([0.3, 0.8]);

export const defaultColorScale = chroma.scale("viridis");

export const fetchColorFromScale = (
  binAssocValue: number,
  minValue: number,
  maxValue: number,
  colorMap: ChromaScale,
) => {
  const scaledColorMap = colorMap.domain([minValue, maxValue]);
  return scaledColorMap(binAssocValue);
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

export const estimateDefaultTubeSize = (
  segment: DrawableMarkSegment,
): number => {
  const scale = segment.attributes.size;

  if (Array.isArray(scale)) {
    const average = scale.reduce((sum, num) => sum + num, 0) / scale.length;
    return average;
  }
  return scale;
};

export const decideVisualParametersBasedOn1DData = (
  segment: DrawableMarkSegment,
  binIndex: number,
): [Color, number] => {
  let scalingFactor = 1.0;
  const colorObj = new Color();

  const attributes = segment.attributes;

  //~ narrowing: ChromaColor or ChromaColor[]
  if (Array.isArray(attributes.color)) {
    colorObj.set(attributes.color[binIndex].hex());
  } else {
    colorObj.set(attributes.color.hex());
  }

  //~ narrowing: ChromaColor or ChromaColor[]
  if (Array.isArray(attributes.size)) {
    scalingFactor = attributes.size[binIndex]; //~ TODO scaling? or maybe that should be done already
  } else {
    scalingFactor = attributes.size;
  }

  return [colorObj, scalingFactor];
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

export const valMap = (
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

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
