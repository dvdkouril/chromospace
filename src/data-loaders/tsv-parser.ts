import type { ChromatinChunk } from "$lib/chromatin";
import { Vector3 } from "three";

export const parseTsv = (fileContent: string): ChromatinChunk => {
    const tsvLines = fileContent.split('\n');

    let bins: Vector3[] = [];
    tsvLines.forEach((line) => {
        const tokens = line.split('\t');
        if (tokens.length < 3) {
            return;
        }

        const x = parseFloat(tokens[0]);
        const y = parseFloat(tokens[1]);
        const z = parseFloat(tokens[2]);

        bins.push(new Vector3(x, y, z));
    });

    return { bins: bins };
};
