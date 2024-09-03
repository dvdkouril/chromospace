import * as pa from "npm:apache-arrow@17.0.0";

if (Deno.args.length < 2) {
  throw new Error("Not enough params! Need input and output path");
}

const inputPath = Deno.args[0];
const outputPath = Deno.args[1];

//~ Read XYZ textfile
const content = await Deno.readTextFile(inputPath);

//~ Parse the XYZ file
const [xArr, yArr, zArr] = parseXYZ(content, "\t");

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

    // const tokens = line.split("\t");
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
