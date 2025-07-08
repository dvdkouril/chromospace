import {
  Field,
  type Float,
  Float64,
  Schema,
  Table,
  tableFromArrays,
  tableFromIPC,
} from "apache-arrow";
import { vec3 } from "gl-matrix";
import type {
  ChromatinStructure
} from "../chromatin-types";
import { flattenAllBins } from "../utils";
import {
  computeModelCenter,
  computeNormalizationFactor,
  type LoadOptions,
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
 * Does a computation with the bin coordinates based on the options
 * returns a copy of the passed array with the changes applied
 */
function processBins(bins: vec3[], options: LoadOptions): vec3[] {
  //~ TODO: idea: just rename the original columns to xOriginal, yOriginal, zOriginal and save the processed positions as x, y, z.
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
 * Make an assertion.
 *
 * @param expr - The expression to test.
 * @param msg - The optional message to display if the assertion fails.
 * @throws an {@link Error} if `expression` is not truthy.
 */
export function assert(expr: unknown, msg?: string): asserts expr {
  if (!expr) {
    throw new Error(msg ?? "");
  }
}

function recenterSingleColumn(col: number[]): number[] {
  const minVal = col.reduce((a, b) => Math.min(a, b), Number.MAX_VALUE);
  const maxVal = col.reduce((a, b) => Math.max(a, b), Number.MIN_VALUE);
  const center = (minVal + maxVal) / 2;

  const centeredCol = col.map((v) => v - center);
  return centeredCol;
}

function recenterXYZColumns(table: Table): Table {

  const columnNames = table.schema.fields.map((f) => f.name);

  assert(columnNames.includes("x"), "x column is missing");
  assert(columnNames.includes("y"), "y column is missing");
  assert(columnNames.includes("z"), "z column is missing");

  const newXCol = recenterSingleColumn(table.getChild("x")!.toArray());
  const newYCol = recenterSingleColumn(table.getChild("y")!.toArray());
  const newZCol = recenterSingleColumn(table.getChild("z")!.toArray());

  // create new arrow table
  // TODO: copy over other columns
  const newTable = tableFromArrays({
    x: newXCol,
    y: newYCol,
    z: newZCol,
  });

  return newTable;
}

function saveOriginalXYZ(table: Table): Table {
  const columnNames = table.schema.fields.map((f) => f.name);
  if (
    !columnNames.includes("x") ||
    !columnNames.includes("y") ||
    !columnNames.includes("z")
  ) {
    console.warn("failed to copy original x, y, z columns, missing one of them");
    return table;
  }

  //~ building in object of arrays from the original table
  const fields = table.schema.fields;
  const oldTableObject = Object.fromEntries(
    fields.map((f) => [f.name, table.getChild(f.name)!.toArray()]),
  );

  //~ copying the original x, y, z columns to new ones
  const xColAsArray = table.getChild("x")!.toArray();
  const yColAsArray = table.getChild("y")!.toArray();
  const zColAsArray = table.getChild("z")!.toArray();

  //~ reassemble the table with duplicated x, y, z columns (as xRaw, yRaw, zRaw)
  return tableFromArrays({
    ...oldTableObject,
    xRaw: xColAsArray,
    yRaw: yColAsArray,
    zRaw: zColAsArray,
  });
}

function processTableAsStructure(table: Table, options?: LoadOptions, name?: string, assembly?: string): ChromatinStructure {
  options = options ?? { center: true, normalize: true };

  // 1. copy original x, y, z columns to the new ones (as backup of raw data)
  let newTable = saveOriginalXYZ(table);

  // 2. center x, y, z coordinates if requested
  //if (options.center) {
  //  newTable = recenterXYZColumns(newTable);
  //}

  // 3. normalize x, y, z coordinates if requested
  //if (options.normalize) {
  //  newTable = normalizeXYZColumns(newTable);
  //}

  console.log(
    `processed Table, with #cols: ${newTable.numCols} and #row: ${newTable.numRows}`,
  );
  return {
    data: newTable,
    name: name ?? "Sample Chromatin Structure",
    assembly: assembly ?? "unknown",
  };
}

/**
 * Turns the Arrow Table into a ChromatinChunk object
 */
function processTableAsChunk(
  table: Table,
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
 * Turns the Arrow Table into a ChromatinModel object
 */
function processTableAsModel(
  table: Table,
  options?: LoadOptions,
): ChromatinModel {
  const parts: ChromatinPart[] = [];
  let currentPart: ChromatinPart | undefined;
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
  let modelResolution = 123;
  const firstRow = table.get(0);
  const secondRow = table.get(1);
  if (firstRow && secondRow) {
    const firstCoord = Number.parseInt(firstRow.coord);
    const secondCoord = Number.parseInt(secondRow.coord);
    modelResolution = secondCoord - firstCoord;
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
        resolution: modelResolution,
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
    const modelCenter = computeModelCenter(parts);
    for (const p of parts) {
      const chunkBins = p.chunk.bins;
      const positionsCentered = chunkBins.map((a) =>
        vec3.sub(vec3.create(), a, modelCenter),
      );
      p.chunk.bins = positionsCentered;
    }
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
 * Loads a 3D chromatin structure from memory using Apache Arrow
 */
export function load(
  buffer: ArrayBuffer,
  options?: LoadOptions,
): ChromatinStructure {
  const bytes = new Uint8Array(buffer);
  const table = tableFromIPC(bytes);
  console.log(
    `loaded Array table, with #cols: ${table.numCols} and #row: ${table.numRows}`,
  );

  return processTableAsStructure(table, options);
}
