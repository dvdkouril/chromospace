import * as pa from "npm:apache-arrow@17.0.0";

if (Deno.args.length < 2) {
  throw new Error("Not enough params! Need input and output path");
}

const inputFormat = Deno.args[2];
const inputPath = Deno.args[0];
const outputPath = Deno.args[1];

//~ Read XYZ textfile
const content = await Deno.readTextFile(inputPath);

//~ Parse the XYZ file
let xArr: number[] = [];
let yArr: number[] = [];
let zArr: number[] = [];
//~ TODO: sense these from the file extension
if (inputFormat === "tsv") {
  [xArr, yArr, zArr] = parseTsv(content);
} else if (inputFormat === "xyz") {
  [xArr, yArr, zArr] = parseXYZ(content, "\t");
} else if (inputFormat === "pdb") {
  [xArr, yArr, zArr] = parsePDB(content);
}

//~ Make the Arrow Table, convert to IPC, write to binary file
const table = pa.tableFromArrays({
  x: xArr,
  y: yArr,
  z: zArr,
});
const ipc = pa.tableToIPC(table);

//~ TODO: check if outputPath ends with '.arrow'
await Deno.writeFile(outputPath, ipc);

console.log(`Writing to ${outputPath}.`);

//~ Test that the file has been written correctly: load back and log
const arrow = await Deno.readFile(outputPath);
const reloadedTable = pa.tableFromIPC(arrow);
console.table(reloadedTable.toArray());

/**
 * Utility function for parsing an XYZ file, mostly follows the de-facto specification: https://en.wikipedia.org/wiki/XYZ_file_format
 */
function parseXYZ(
  fileContent: string,
  delimiter: string,
): [number[], number[], number[]] {
  const xArr: number[] = [];
  const yArr: number[] = [];
  const zArr: number[] = [];

  const tsvLines = fileContent.split("\n");
  let lineNumber = 0;
  const firstLine = tsvLines[0];
  const lineNum = Number.parseInt(firstLine);
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

    const tokens = line.split(delimiter);
    if (tokens.length < 4) {
      return;
    }

    const x = Number.parseFloat(tokens[1]);
    const y = Number.parseFloat(tokens[2]);
    const z = Number.parseFloat(tokens[3]);

    xArr.push(x);
    yArr.push(y);
    zArr.push(z);
  });

  console.log(`Parsed XYZ file with: ${xArr.length} rows`);

  return [xArr, yArr, zArr];
}

/**
 * Utility for parsing the 3D coordinates in a tab separated values file format.
 */
function parseTsv(fileContent: string): [number[], number[], number[]] {
  const tsvLines = fileContent.split("\n");

  tsvLines.forEach((line) => {
    const tokens = line.split("\t");
    if (tokens.length < 3) {
      return;
    }

    const x = Number.parseFloat(tokens[0]);
    const y = Number.parseFloat(tokens[1]);
    const z = Number.parseFloat(tokens[2]);

    xArr.push(x);
    yArr.push(y);
    zArr.push(z);
  });

  return [xArr, yArr, zArr];
}

/**
 * Utility function for parsing the Protein Data Bank (PDB) format, which is often used for 3D chromatin.
 */
function parsePDB(fileContent: string): [number[], number[], number[]] {
  const pdbLines = fileContent.split("\n");

  const xArr: number[] = [];
  const yArr: number[] = [];
  const zArr: number[] = [];
  const hetatms: number[][] = [];
  // let bins: vec3[] = [];
  for (const line of pdbLines) {
    const lineAnnot = line.substring(0, 6).trim();
    if (lineAnnot === "HETATM" || lineAnnot === "ATOM") {
      const x = Number.parseFloat(line.substring(30, 38));
      const y = Number.parseFloat(line.substring(38, 46));
      const z = Number.parseFloat(line.substring(46, 54));

      hetatms.push([x, y, z]);
    }
    if (lineAnnot === "CONECT") {
      /**
       * Honestly, this just shows how unsuitable PDB is for chromatin,
       * we will always have just a sequence of bins, each with two neigh-
       * bors (except first and last).
       *
       * According to this: https://files.wwpdb.org/pub/pdb/doc/format_descriptions/Format_v33_Letter.pdf
       * you can have up to 4 neighbors.
       */
      const current = Number.parseInt(line.substring(6, 11)); //TODO: are these indices correct?
      // const previous  = parseInt(line.substring(11, 16));
      // const next  = parseInt(line.substring(16, 21));
      // bins.push(hetatms[current - 1]);
      xArr.push(hetatms[current - 1][0]);
      yArr.push(hetatms[current - 1][1]);
      zArr.push(hetatms[current - 1][2]);
    }
  }

  return [xArr, yArr, zArr];
}
