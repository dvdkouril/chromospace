import type { ChromatinChunk } from '../chromatin';
import { vec3 } from 'gl-matrix';
import { LoadOptions, normalize, recenter } from './loader-utils';

let nextId = -1;

export const parseTsv = (fileContent: string, options: LoadOptions): ChromatinChunk => {
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

export const parse3dg = (fileContent: string, options: LoadOptions): ChromatinChunk => {
    const tsvLines = fileContent.split('\n');

    let bins: vec3[] = [];
    tsvLines.forEach((line) => {
        const tokens = line.split('\t');
        if (tokens.length < 5) {
            return;
        }

        // const chrom = tokens[0];
        // const startCoord = tokens[1];
        const x = parseFloat(tokens[2]);
        const y = parseFloat(tokens[3]);
        const z = parseFloat(tokens[4]);

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
