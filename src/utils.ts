import { vec3 } from "gl-matrix";
import { ChromatinChunk, ChromatinModelViewConfig } from "./chromatin-types";
import { Vector3, Euler, Quaternion, Color } from "three";
import type { Color as ChromaColor, Scale as ChromaScale } from "chroma-js";
import chroma from "chroma-js";

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

export const computeTubes = (
  bins: vec3[],
): { position: Vector3; rotation: Euler; scale: number }[] => {
  const t: { position: Vector3; rotation: Euler; scale: number }[] = [];
  for (let i = 0; i < bins.length - 1; i++) {
    const first = new Vector3(bins[i][0], bins[i][1], bins[i][2]);
    const second = new Vector3(bins[i + 1][0], bins[i + 1][1], bins[i + 1][2]);

    //~ position between the two bins
    const pos = new Vector3();
    pos.subVectors(second, first);
    pos.divideScalar(2);
    pos.addVectors(first, pos);
    const tubePosition = pos;
    //~ rotation
    const tubeRotation = getRotationFromTwoPositions(first, second);
    //~ tube length
    const betweenVec = new Vector3();
    betweenVec.subVectors(second, first);
    const tubeScale = betweenVec.length();

    t.push({
      position: tubePosition,
      rotation: tubeRotation,
      scale: tubeScale,
    });
  }

  return t;
};

const getRotationFromTwoPositions = (from: Vector3, to: Vector3) => {
  const fromCopy = new Vector3(from.x, from.y, from.z);
  const toCopy = new Vector3(to.x, to.y, to.z);
  const q = new Quaternion();
  const u = new Vector3(0, 1, 0);
  const v = toCopy.sub(fromCopy).normalize();

  q.setFromUnitVectors(u, v);

  const eulers = new Euler();
  return eulers.setFromQuaternion(q);
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
export function decideVisualParameters(viewConfig: ChromatinModelViewConfig, i: number, n: number): [ChromaColor | undefined, ChromaScale | undefined, number] {
  let color: ChromaColor | undefined = undefined;
  let scale: ChromaScale | undefined = undefined;
  // let size = 1.0;
  let size = 0.001; //TODO: estimate

  const needColorsN = n;
  const chunkColors = customCubeHelix.scale().colors(needColorsN, null);
  const deemphasizedColor = chroma("#a3a3a3");
  const hasSelection = viewConfig.selections.length > 0;

  if (viewConfig.coloring == "constant") {
    color = hasSelection ? deemphasizedColor : chunkColors[i];
  } else if (viewConfig.coloring == "scale") {
    color = hasSelection ? deemphasizedColor : undefined;
    scale = hasSelection ? undefined : defaultColorScale;
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
