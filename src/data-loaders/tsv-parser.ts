import type { ChromatinChunk, ChromatinPart, ChromatinModel } from '../chromatin';
import { vec3 } from 'gl-matrix';
import { LoadOptions, normalize, computeNormalizationFactor, recenter } from './loader-utils';
import { flattenAllBins } from '../utils';

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

const getResolution = (firstLine: string, secondLine: string): number => {
    const tokensFirst = firstLine.split('\t');
    const tokensSecond = secondLine.split('\t');
    const startCoord1 = parseInt(tokensFirst[1]);
    const startCoord2 = parseInt(tokensSecond[1]);
    return startCoord2 - startCoord1;
}

export const parse3dg = (fileContent: string, options: LoadOptions): ChromatinModel | undefined => {
    const tsvLines = fileContent.split('\n');

    let parts: ChromatinPart[] = [];
    let currentPart: ChromatinPart | undefined = undefined;
    let prevChrom = "";
    const modelResolution = getResolution(tsvLines[0], tsvLines[1]);
    tsvLines.forEach((line) => {
        const tokens = line.split('\t');
        if (tokens.length < 5) {
            return;
        }

        const chrom = tokens[0];
        const startCoord = tokens[1];
        if (chrom != prevChrom || currentPart == undefined) {
            // new part
            currentPart = {
                chunk: {
                    bins: [],
                    rawBins: [],
                    id: ++nextId,
                },
                coordinates: { start: parseInt(startCoord), end: parseInt(startCoord) },
                resolution: modelResolution,
                label: chrom,
            };
            parts.push(currentPart);
        }

        const x = parseFloat(tokens[2]);
        const y = parseFloat(tokens[3]);
        const z = parseFloat(tokens[4]);

        currentPart.chunk.bins.push(vec3.fromValues(x, y, z));
        prevChrom = chrom;
    });

    if (options.center) {
        console.log("TODO: center bins when loading model");
    }
    
    if (options.normalize) {
        //~ parts.bins -> allBins
        const allBins: vec3[] = flattenAllBins(parts.map(p => p.chunk));
        const scaleFactor = computeNormalizationFactor(allBins);
        for (let i = 0; i < parts.length; i++) {
            const bins = parts[i].chunk.bins;
            parts[i].chunk.bins = normalize(bins, scaleFactor);
        }
    }

    return {
        parts: parts,
        position: { x: 0, y: 0, z: 0 },
    };
};
