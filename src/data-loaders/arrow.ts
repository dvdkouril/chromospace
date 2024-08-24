import { Float, Table, tableFromIPC } from 'apache-arrow';
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
    console.log("heyyyyy");
    return load(buffer, options);
  } catch (err: any) {
    console.error(err.message);
    return "whateverr";
  }
}

/**
  * Loads a 3D chromatin model from memory. Uses Apache Arrow.
  * TODO: Three options for input:
  * - Parquet file: URL or local path
  * - Arrow IPC
  * - DataView (from Python)
  */
export function load(
  buffer: ArrayBuffer,
  options?: LoadOptions,
): ChromatinChunk | ChromatinModel {
  const bytes = new Uint8Array(buffer);
  const table = tableFromIPC<{ x: Float, y: Float, z: Float }>(bytes);
  console.log("loaded Parquet table, with #cols: " + table.numCols + " and #row: " + table.numRows);

  const columnNames = table.schema.fields.map(f => f.name);
  const hasXYZ =
    columnNames.includes("x") &&
    columnNames.includes("y") &&
    columnNames.includes("z");
  if (!hasXYZ) {
    console.error("Arrow Table doesn't contain x, y, z coordinates!");
  }

  let bins: vec3[] = []; //~ TODO:
  for (let i = 0; i < table.numRows; i++) {
    const row = table.get(i)!;
    row.x
    const xCol = table.getChild("x");
    const yCol = table.getChild("y");
    const zCol = table.getChild("z");
    if ((xCol != null) && (yCol != null) && (zCol != null)) {
      const x = xCol.get(i) as number;
      const y = yCol.get(i) as number;
      const z = zCol.get(i) as number;

      bins.push(vec3.fromValues(x, y, z));
    }
  }

  const rawBins = bins;
  options = options || { center: true, normalize: true };
  if (options.center) {
    bins = recenter(bins);
  }

  if (options.normalize) {
    bins = normalize(bins);
  }

  //~ data will probably represent a model if a column named i.e., 'chromosome' is present. 
  const isModel = (table.numCols > 3); // TODO: needs a better check (check for x, y, z etc.)
  if (!isModel) { // -> ChromatinChunk
    return {
      bins: bins,
      rawBins: rawBins,
      id: 0,
    };
  } else { // -> ChromatinModel
    return {
      parts: [],
    };
  }
}
