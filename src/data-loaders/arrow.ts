import {
  type Float,
  type Schema,
  type Table,
  tableFromIPC,
} from "apache-arrow";
import { vec3 } from "gl-matrix";
import type {
  ChromatinChunk,
  ChromatinModel,
  ChromatinPart,
} from "../chromatin-types";
import { flattenAllBins } from "../utils";
import {
  type LoadOptions,
  computeNormalizationFactor,
  normalize,
  recenter,
} from "./loader-utils";

/*
 * Inspired by: https://github.com/vega/vega-loader-arrow/blob/main/src/arrow.js
 */

export async function loadFromURL(
  url: string,
  options: LoadOptions,
): Promise<ChromatinChunk | ChromatinModel | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return load(buffer, options);
  } catch (err) {
    let message = "Unknown Error";
    if (err instanceof Error) message = err.message;
    console.error(message);
    return undefined;
  }
}

/**
 * Will return true if the table schema contains only 3 columns named x, y, z
 */
function isChunk(tableSchema: Schema): boolean {
  return tableSchema.fields.length === 3 && hasXYZ(tableSchema);
}

/**
 * Returns true when table schema contains x, y, z fields
 */
function hasXYZ(tableSchema: Schema): boolean {
  const columnNames = tableSchema.fields.map((f) => f.name);
  return (
    columnNames.includes("x") &&
    columnNames.includes("y") &&
    columnNames.includes("z")
  );
}

/**
 * Does a computation with the bin coordinates based on the options
 * returns a copy of the passed array with the changes applied
 */
function processBins(bins: vec3[], options: LoadOptions): vec3[] {
  let binsCopy = [...bins];
  if (options.center) {
    binsCopy = recenter(binsCopy);
  }

  if (options.normalize) {
    binsCopy = normalize(binsCopy);
  }
  return binsCopy;
}

/**
 * Turns the Arrow Table into a ChromatinChunk object
 */
function processTableAsChunk(
  table: Table<any>,
  options?: LoadOptions,
): ChromatinChunk {
  const typedTable = table as Table<{ x: Float; y: Float; z: Float }>;
  let bins: vec3[] = [];
  for (let i = 0; i < typedTable.numRows; i++) {
    const row = typedTable.get(i);
    if (row) {
      bins.push(vec3.fromValues(row.x, row.y, row.z));
    } else {
      console.error("Row of XYZ coords");
    }
  }

  const rawBins = bins; //~ saving the original, unprocessed data
  options = options || { center: true, normalize: true };
  bins = processBins(bins, options);

  return {
    bins: bins,
    rawBins: rawBins,
    id: 0,
  };
}

/**
 * TODO:Turns the Arrow Table into a ChromatinModel object
 */
function processTableAsModel(
  table: Table<any>,
  options?: LoadOptions,
): ChromatinModel {
  const parts: ChromatinPart[] = [];
  let currentPart: ChromatinPart | undefined = undefined;
  let prevChrom = "";

  const xCol = table.getChild("x");
  const yCol = table.getChild("y");
  const zCol = table.getChild("z");
  const chrCol = table.getChild("chr");
  const coordCol = table.getChild("coord");
  if (
    xCol === null ||
    yCol === null ||
    zCol === null ||
    chrCol === null ||
    coordCol === null
  ) {
    return { parts: [] };
  }
  for (let i = 0; i < table.numRows; i++) {
    const chrom = chrCol?.get(i) as string;
    const startCoord = coordCol.get(i) as string;
    const x = xCol.get(i) as number;
    const y = yCol.get(i) as number;
    const z = zCol.get(i) as number;

    if (chrom !== prevChrom || currentPart === undefined) {
      // new part
      currentPart = {
        chunk: {
          bins: [],
          rawBins: [],
          id: 0, // TODO:
        },
        coordinates: {
          start: Number.parseInt(startCoord),
          end: Number.parseInt(startCoord),
          chromosome: chrom,
        },
        resolution: 0, // TODO: delete if I'm not actually using it anywhere
        label: chrom,
      };
      parts.push(currentPart);
    }

    currentPart.chunk.bins.push(vec3.fromValues(x, y, z));
    currentPart.coordinates.end = Number.parseInt(startCoord); //~ keep pushing the end of this part bin by bin
    prevChrom = chrom;
  }

  // const rawBins = bins; //~ saving the original, unprocessed data
  // TODO: I'm not saving rawBins for ChromatinModels atm?
  options = options || { center: true, normalize: true };
  if (options.center) {
    console.log("TODO: center bins when loading model");
  }

  if (options.normalize) {
    //~ parts.bins -> allBins
    const allBins: vec3[] = flattenAllBins(parts.map((p) => p.chunk));
    const scaleFactor = computeNormalizationFactor(allBins);
    for (let i = 0; i < parts.length; i++) {
      const bins = parts[i].chunk.bins;
      parts[i].chunk.bins = normalize(bins, scaleFactor);
    }
  }

  return {
    parts: parts,
  };
}

/**
 * Loads a 3D chromatin model from memory using Apache Arrow
 */
export function load(
  buffer: ArrayBuffer,
  options?: LoadOptions,
): ChromatinChunk | ChromatinModel {
  const bytes = new Uint8Array(buffer);
  const table = tableFromIPC(bytes);
  console.log(
    `loaded Array table, with #cols: ${table.numCols} and #row: ${table.numRows}`,
  );

  if (isChunk(table.schema)) {
    // -> ChromatinChunk
    return processTableAsChunk(table, options);
  }
  // -> ChromatinModel
  return processTableAsModel(table, options);
}
