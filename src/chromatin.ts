import { vec3 } from 'gl-matrix';

export type GenomicCoordinates = {
    start: number;
    end: number;
};

// export type ChromatinPart = {
//     bins: vec3[];
//     coordinates: GenomicCoordinates;
//     resolution: number;
//     label?: string; //~ placeholder for determining some semantics of this part (e.g., chromosome, gene location)
// };

// The idea is that you want to have completely anonymous parts, too
// for when you don't have any other identifying data about the bins.
export type ChromatinChunk = {
    bins: vec3[];
    rawBins: vec3[]; //~ bin positions before any processing (recenter, normalize)
    
    coordinates?: GenomicCoordinates;

    label?: string;
    id: number;
};

export type ChromatinModel = {
    // parts: ChromatinPart[];
    parts: ChromatinChunk[];
    position: {x: number; y: number; z: number};
}

export type ChromatinScene = {
    chunks: ChromatinChunk[];
    models: ChromatinModel[];

    config: {
        layout: "center" | "grid";
    };
}

export function addChunkToScene(scene: ChromatinScene, chunk: ChromatinChunk): ChromatinScene {
    scene = {
        ...scene,
        chunks: [...scene.chunks, chunk]
    };
    return scene;
}

export function addModelToScene(scene: ChromatinScene, model: ChromatinModel) {
    scene = {
        ...scene,
        models: [...scene.models, model]
    };
    return scene;
}

/**
 * Query for bin positions on specified genomic coordinates
 * @param coordinates 
 * @returns chromatin part, i.e., list of bin positions corresponding to the genomic coordinates
 */
export function getRange(model: ChromatinModel, coordinates: string): ChromatinChunk | null {
    console.log(`getRange with ${model} and ${coordinates}`);

    return null;
}
