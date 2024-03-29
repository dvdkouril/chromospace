import { ChromatinChunk } from "../chromatin-types";
import { LoadOptions, normalize, recenter } from "./loader-utils";
import { vec3 } from "gl-matrix";

/**
 * The Protein Data Bank (PDB) format is often used for 3D chromatin.
 */

export const parsePDB = (
  fileContent: string,
  options: LoadOptions,
): ChromatinChunk => {
  const pdbLines = fileContent.split("\n");

  let hetatms: vec3[] = [];
  let bins: vec3[] = [];
  pdbLines.forEach((line) => {
    const lineAnnot = line.substring(0, 6);
    if (lineAnnot == "HETATM") {
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));

      hetatms.push(vec3.fromValues(x, y, z));
    }
    if (lineAnnot == "CONECT") {
      /**
       * Honestly, this just shows how unsuitable PDB is for chromatin,
       * we will always have just a sequence of bins, each with two neigh-
       * bors (except first and last).
       *
       * According to this: https://files.wwpdb.org/pub/pdb/doc/format_descriptions/Format_v33_Letter.pdf
       * you can have up to 4 neighbors.
       */
      const current = parseInt(line.substring(6, 11)); //TODO: are these indices correct?
      // const previous  = parseInt(line.substring(11, 16));
      // const next  = parseInt(line.substring(16, 21));
      bins.push(hetatms[current - 1]);
    }
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
    id: 0,
  };
};

//******
//MOVEEEEEEE

export const parseNumpyArray = (
  fileContent: DataView,
  options: LoadOptions,
): ChromatinChunk => {
  let bytes = new Float64Array(fileContent.buffer);
  let bins: vec3[] = [];
  for (let i = 0; i < bytes.length - 2; ) {
    const x = bytes[i];
    const y = bytes[i + 1];
    const z = bytes[i + 2];
    // console.log("x = " + x + ", y = " + y + ", z = " + z);
    i += 3;

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      continue;
    }
    bins.push(vec3.fromValues(x, y, z));
  }

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
    id: 0,
  };
};
