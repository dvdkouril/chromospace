import { vec3 } from 'gl-matrix';
import { ChromatinBasicRenderer} from './renderer/ChromatinBasicRenderer';

export type GenomicCoordinates = {
    start: number;
    end: number;
};

/**
 * A simple list of bin positions. 
 * Used in two scenarios: 
 *  a) an "anonymous" chunk of chromatin data, and 
 *  b) properly annotated part of a larger model (e.g., in whole-genome model, chromosomes will be different chunks).
 */
export type ChromatinChunk = {
    bins: vec3[];
    /** 
     * bin positions before any processing (recenter, normalize)
     */
    rawBins: vec3[]; 
    
    id: number;
};

/**
 * Adds information identifying the 3D part on genomic sequence
 */
export type ChromatinPart = {
    chunk: ChromatinChunk;

    coordinates: GenomicCoordinates;
    resolution: number;

    label?: string;
};

/**
 * A full model that contains annotation about which genomic regions the individual parts correspond to
 */
export type ChromatinModel = {
    parts: ChromatinPart[];
    position: {x: number; y: number; z: number};
}

export type ChromatinScene = {
    chunks: ChromatinChunk[];
    models: ChromatinModel[];

    config: {
        layout: "center" | "grid";
    };
}

/**
 * Utility function to add a chunk to scene
 */
export function addChunkToScene(scene: ChromatinScene, chunk: ChromatinChunk): ChromatinScene {
    scene = {
        ...scene,
        chunks: [...scene.chunks, chunk]
    };
    return scene;
}

/**
 * Utility function to add a model to scene
 */
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

export function display(scene: ChromatinScene): HTMLCanvasElement {
    const renderer = new ChromatinBasicRenderer();
    renderer.addScene(scene);
    renderer.startDrawing();
    const canvas = renderer.getCanvasElement();
    return canvas;
}
