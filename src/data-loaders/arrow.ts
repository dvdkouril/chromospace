import {
  Table,
  tableFromArrays,
  tableFromIPC,
} from "apache-arrow";
import type {
  ChromatinStructure
} from "../chromatin-types";
import {
  type LoadOptions,
} from "./loader-utils";
import { assert } from "../assert.ts";

/*
 * Inspired by: https://github.com/vega/vega-loader-arrow/blob/main/src/arrow.js
 */

export async function loadFromURL(
  url: string,
  options: LoadOptions,
): Promise<ChromatinStructure | undefined> {
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
  if (options.center) {
    newTable = recenterXYZColumns(newTable);
  }

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
