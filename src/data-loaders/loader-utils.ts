import type { Schema } from "apache-arrow";
import { vec3 } from "gl-matrix";
import type { ChromatinPart } from "../chromatin-types";

export type LoadOptions = {
  center?: boolean;
  normalize?: boolean;
};

/**
 * Will return true if the table schema contains only 3 columns named x, y, z
 */
export function isChunk(tableSchema: Schema): boolean {
  return tableSchema.fields.length === 3 && hasXYZ(tableSchema);
}

/**
 * Returns true when table schema contains x, y, z fields
 */
export function hasXYZ(tableSchema: Schema): boolean {
  const columnNames = tableSchema.fields.map((f) => f.name);
  return (
    columnNames.includes("x") &&
    columnNames.includes("y") &&
    columnNames.includes("z")
  );
}

export const recenter = (originalPositions: vec3[]): vec3[] => {
  const positions = originalPositions;

  const bbMax = positions.reduce(
    (a, b) => vec3.max(vec3.create(), a, b),
    vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE),
  );
  const bbMin = positions.reduce(
    (a, b) => vec3.min(vec3.create(), a, b),
    vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
  );
  const bbCenter = vec3.scale(
    vec3.create(),
    vec3.add(vec3.create(), bbMax, bbMin),
    0.5,
  );
  const bbSides = vec3.sub(vec3.create(), bbMax, bbMin);
  bbSides.forEach((v: number) => Math.abs(v));

  const positionsCentered = positions.map((a) =>
    vec3.sub(vec3.create(), a, bbCenter),
  );

  return positionsCentered;
};

export const normalize = (positions: vec3[], factor?: number): vec3[] => {
  const scaleFactor =
    factor === undefined ? computeNormalizationFactor(positions) : factor;

  const positionsNormalized = positions.map((p) =>
    vec3.scale(p, p, scaleFactor),
  );

  return positionsNormalized;
};

export const computeNormalizationFactor = (positions: vec3[]): number => {
  const bbMax = positions.reduce(
    (a, b) => vec3.max(vec3.create(), a, b),
    vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE),
  );
  const bbMin = positions.reduce(
    (a, b) => vec3.min(vec3.create(), a, b),
    vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
  );
  const bbCenter = vec3.scale(
    vec3.create(),
    vec3.add(vec3.create(), bbMax, bbMin),
    0.5,
  );
  console.log(bbCenter);
  const bbSides = vec3.sub(vec3.create(), bbMax, bbMin);
  const maxDim = Math.max(...bbSides);
  const scaleFactor = 1 / maxDim;

  return scaleFactor;
};

function findCenter(bins: vec3[]): vec3 {
  // If we only get a single bin then the bounding box has 0x0x0 dimensions,
  // which, for some reason, messes up the results
  if (bins.length === 1) {
    return bins[0];
  }

  const positions = bins;
  const bbMax = positions.reduce(
    (a, b) => vec3.max(vec3.create(), a, b),
    vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE),
  );
  const bbMin = positions.reduce(
    (a, b) => vec3.min(vec3.create(), a, b),
    vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
  );
  const bbCenter = vec3.scale(
    vec3.create(),
    vec3.add(vec3.create(), bbMax, bbMin),
    0.5,
  );
  return bbCenter;
}

/**
 * I'm actually not sure if this approach will work:
 * - compute center for each of the parts separately
 * - then compute center of the centers
 */
export function computeModelCenter(parts: ChromatinPart[]): vec3 {
  const centersOfParts: vec3[] = [];
  for (const p of parts) {
    const partCenter = findCenter(p.chunk.bins);
    centersOfParts.push(partCenter);
  }

  const modelCenter = findCenter(centersOfParts);

  return modelCenter;
}
