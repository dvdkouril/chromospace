import { Table, Schema, Float, tableFromIPC } from 'apache-arrow';
import { type LoadOptions, normalize, recenter } from "./loader-utils";
import { ChromatinChunk, ChromatinModel } from '../chromatin-types';
import { vec3 } from 'gl-matrix';

/*
 * Inspired by: https://github.com/vega/vega-loader-arrow/blob/main/src/arrow.js
 */

export async function loadFromURL(url: string, options: LoadOptions): Promise<ChromatinChunk | ChromatinModel | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return load(buffer, options);
  } catch (err: any) {
    console.error(err.message);
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
  const columnNames = tableSchema.fields.map(f => f.name);
  return columnNames.includes("x") &&
    columnNames.includes("y") &&
    columnNames.includes("z");
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
function processTableAsChunk(table: Table<any>, options?: LoadOptions): ChromatinChunk {
  const typedTable = table as Table<{ x: Float, y: Float, z: Float }>;
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
function processTableAsModel(): ChromatinModel {
  return {
    parts: [],
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
  console.log("loaded Array table, with #cols: " + table.numCols + " and #row: " + table.numRows);

  if (isChunk(table.schema)) { // -> ChromatinChunk
    return processTableAsChunk(table, options);
  } else { // -> ChromatinModel
    return processTableAsModel();
  }
}
