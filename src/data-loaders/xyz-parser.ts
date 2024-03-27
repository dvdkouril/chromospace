import type {
  ChromatinChunk
} from "../chromatin-types";
import { vec3 } from "gl-matrix";
import {
  LoadOptions,
  normalize,
  recenter,
} from "./loader-utils";
import chroma from "chroma-js";

let nextId = -1;

export const parseXYZ = (
  fileContent: string,
  delimiter: string,
  options: LoadOptions,
): ChromatinChunk => {
  const tsvLines = fileContent.split("\n");

  let lineNumber = 0;

  const firstLine = tsvLines[0];
  const lineNum = parseInt(firstLine);

  let bins: vec3[] = [];
  tsvLines.forEach((line) => {
    if (lineNumber < 2) {
      lineNumber += 1;
      return;
    }
    //~ only loading the first conformation
    if (lineNumber > lineNum) {
      return;
    }
    lineNumber += 1;

    // const tokens = line.split("\t");
    const tokens = line.split(delimiter);
    if (tokens.length < 4) {
      return;
    }

    const x = parseFloat(tokens[1]);
    const y = parseFloat(tokens[2]);
    const z = parseFloat(tokens[3]);

    bins.push(vec3.fromValues(x, y, z));
  });

  const rawBins = bins;

  if (options.center) {
    bins = recenter(bins);
  }

  if (options.normalize) {
    bins = normalize(bins);
  }

  return {
    bins: bins,
    rawBins: rawBins,
    id: ++nextId,
    color: chroma.random().hex(),
  };
};
