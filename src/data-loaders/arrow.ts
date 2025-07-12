import { type Table, tableFromArrays, tableFromIPC } from "apache-arrow";
import { vec3 } from "gl-matrix";
import { assert } from "../assert.ts";
import type { ChromatinStructure } from "../chromatin-types";
import { computeNormalizationFactor, type LoadOptions } from "./loader-utils";

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
  console.log("Recentering x, y, z columns...");

  const columnNames = table.schema.fields.map((f) => f.name);

  assert(columnNames.includes("x"), "x column is missing");
  assert(columnNames.includes("y"), "y column is missing");
  assert(columnNames.includes("z"), "z column is missing");

  const newXCol = recenterSingleColumn(table.getChild("x")?.toArray());
  const newYCol = recenterSingleColumn(table.getChild("y")?.toArray());
  const newZCol = recenterSingleColumn(table.getChild("z")?.toArray());

  //~ building in object of arrays from the original table
  const fields = table.schema.fields;
  const oldTableObject = Object.fromEntries(
    fields.map((f) => [f.name, table.getChild(f.name)?.toArray()]),
  );
  const newTable = tableFromArrays({
    ...oldTableObject,
    x: newXCol,
    y: newYCol,
    z: newZCol,
  });

  return newTable;
}

function normalizeXYZColumns(table: Table): Table {
  const columnNames = table.schema.fields.map((f) => f.name);

  assert(columnNames.includes("x"), "x column is missing");
  assert(columnNames.includes("y"), "y column is missing");
  assert(columnNames.includes("z"), "z column is missing");

  //~ get the original x, y, z positions as arrays
  const origXCol = table.getChild("x")?.toArray();
  const origYCol = table.getChild("y")?.toArray();
  const origZCol = table.getChild("z")?.toArray();

  //~ assemble them to vec3 array
  const positions: vec3[] = [];
  for (let i = 0; i < table.numRows; i++) {
    positions.push(vec3.fromValues(origXCol[i], origYCol[i], origZCol[i]));
  }

  //~ compute normalization factor, TODO: I guess there might be a more efficient way but this reuses the same function as before
  const scalingFactor = computeNormalizationFactor(positions);

  //~ scale the positions
  const positionsNormalized = positions.map((p) =>
    vec3.scale(p, p, scalingFactor),
  );

  //~ turn back to coordinate arrays
  const newXCol = positionsNormalized.map((p) => p[0]);
  const newYCol = positionsNormalized.map((p) => p[1]);
  const newZCol = positionsNormalized.map((p) => p[2]);

  //~ building in object of arrays from the original table
  const fields = table.schema.fields;
  const oldTableObject = Object.fromEntries(
    fields.map((f) => [f.name, table.getChild(f.name)?.toArray()]),
  );
  const newTable = tableFromArrays({
    ...oldTableObject,
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
    console.warn(
      "failed to copy original x, y, z columns, missing one of them",
    );
    return table;
  }

  //~ building in object of arrays from the original table
  const fields = table.schema.fields;
  const oldTableObject = Object.fromEntries(
    fields.map((f) => [f.name, table.getChild(f.name)?.toArray()]),
  );

  //~ copying the original x, y, z columns to new ones
  const xColAsArray = table.getChild("x")?.toArray();
  const yColAsArray = table.getChild("y")?.toArray();
  const zColAsArray = table.getChild("z")?.toArray();

  //~ reassemble the table with duplicated x, y, z columns (as xRaw, yRaw, zRaw)
  return tableFromArrays({
    ...oldTableObject,
    xRaw: xColAsArray,
    yRaw: yColAsArray,
    zRaw: zColAsArray,
  });
}

function processTableAsStructure(
  table: Table,
  options?: LoadOptions,
  name?: string,
  assembly?: string,
): ChromatinStructure {
  options = options ?? { center: true, normalize: true };

  // 1. copy original x, y, z columns to the new ones (as backup of raw data)
  let newTable = saveOriginalXYZ(table);

  // 2. center x, y, z coordinates if requested
  if (options.center) {
    newTable = recenterXYZColumns(newTable);
  }

  // 3. normalize x, y, z coordinates if requested
  if (options.normalize) {
    newTable = normalizeXYZColumns(newTable);
  }

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
