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

let nextId = -1;

/**
 * Utility for parsing the 3D coordinates in a tab separated values file format.
 */
export const parseTsv = (
  fileContent: string,
  options: LoadOptions,
): ChromatinChunk => {
  const tsvLines = fileContent.split("\n");

  let bins: vec3[] = [];
  tsvLines.forEach((line) => {
    const tokens = line.split("\t");
    if (tokens.length < 3) {
      return;
    }

    const x = Number.parseFloat(tokens[0]);
    const y = Number.parseFloat(tokens[1]);
    const z = Number.parseFloat(tokens[2]);

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
  };
};

const getResolution = (firstLine: string, secondLine: string): number => {
  const tokensFirst = firstLine.split("\t");
  const tokensSecond = secondLine.split("\t");
  const startCoord1 = Number.parseInt(tokensFirst[1]);
  const startCoord2 = Number.parseInt(tokensSecond[1]);
  return startCoord2 - startCoord1;
};

/**
 * Utility function for parsing the 3DG format (e.g., the Tan et al. 2018 whole genome model)
 */
export const parse3dg = (
  fileContent: string,
  options: LoadOptions,
): ChromatinModel | undefined => {
  const tsvLines = fileContent.split("\n");

  const parts: ChromatinPart[] = [];
  let currentPart: ChromatinPart | undefined = undefined;
  let prevChrom = "";
  const modelResolution = getResolution(tsvLines[0], tsvLines[1]);
  tsvLines.forEach((line) => {
    const tokens = line.split("\t");
    if (tokens.length < 5) {
      return;
    }

    const chrom = tokens[0];
    const startCoord = tokens[1];
    if (chrom !== prevChrom || currentPart === undefined) {
      // new part
      currentPart = {
        chunk: {
          bins: [],
          rawBins: [],
          id: ++nextId,
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

    const x = Number.parseFloat(tokens[2]);
    const y = Number.parseFloat(tokens[3]);
    const z = Number.parseFloat(tokens[4]);

    currentPart.chunk.bins.push(vec3.fromValues(x, y, z));
    currentPart.coordinates.end = Number.parseInt(startCoord); //~ keep pushing the end of this part bin by bin
    prevChrom = chrom;
  });

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
};

/**
 * Specific utility function for parsing TSV outputted by MiniMDS software.
 */
export const parseWeirdTsvFromMiniMDS = (
  fileContent: string,
  options: LoadOptions,
): ChromatinChunk | undefined => {
  const tsvLines = fileContent.split("\n");

  // let parts: ChromatinPart[] = [];
  let bins: vec3[] = [];
  // let currentPart: ChromatinPart | undefined = undefined;
  // let prevChrom = "";
  // const modelResolution = getResolution(tsvLines[0], tsvLines[1]);
  let lineNumber = 0;
  tsvLines.forEach((line) => {
    if (lineNumber < 3) {
      lineNumber += 1;
      return;
    }
    lineNumber += 1;

    const tokens = line.split("\t");
    // if (tokens.length < 5) {
    //   return;
    // }

    // const chrom = tokens[0];
    // const startCoord = tokens[1];
    // if (chrom != prevChrom || currentPart == undefined) {
    //   // new part
    //   currentPart = {
    //     chunk: {
    //       bins: [],
    //       rawBins: [],
    //       id: ++nextId,
    //     },
    //     coordinates: { start: parseInt(startCoord), end: parseInt(startCoord) },
    //     resolution: modelResolution,
    //     label: chrom,
    //   };
    //   parts.push(currentPart);
    // }

    const x = Number.parseFloat(tokens[1]);
    const y = Number.parseFloat(tokens[2]);
    const z = Number.parseFloat(tokens[3]);
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
      return;
    }

    bins.push(vec3.fromValues(x, y, z));
    // currentPart.chunk.bins.push(vec3.fromValues(x, y, z));
    // currentPart.coordinates.end = parseInt(startCoord); //~ keep pushing the end of this part bin by bin
    // prevChrom = chrom;
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
  };
};
