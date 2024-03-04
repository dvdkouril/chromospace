import type { ChromatinChunk } from '../chromatin';
import { vec3 } from 'gl-matrix';

export const parseTsv = (fileContent: string): ChromatinChunk => {
    const tsvLines = fileContent.split('\n');

    let bins: vec3[] = [];
    tsvLines.forEach((line) => {
        const tokens = line.split('\t');
        if (tokens.length < 3) {
            return;
        }

        const x = parseFloat(tokens[0]);
        const y = parseFloat(tokens[1]);
        const z = parseFloat(tokens[2]);

        bins.push(vec3.fromValues(x, y, z));
    });

    const normalized: vec3[] = [];

    return { 
        bins: bins, 
        binsNormalized: normalized,
    };
};
