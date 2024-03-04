import type { BinPosition, ChromatinChunk } from "../chromatin";

export const parseTsv = (fileContent: string): ChromatinChunk => {
    const tsvLines = fileContent.split('\n');

    let bins: BinPosition[] = [];
    tsvLines.forEach((line) => {
        const tokens = line.split('\t');
        if (tokens.length < 3) {
            return;
        }

        const x = parseFloat(tokens[0]);
        const y = parseFloat(tokens[1]);
        const z = parseFloat(tokens[2]);

        bins.push({x: x, y: y, z: z});
    });

    return { bins: bins };
};
