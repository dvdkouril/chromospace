import type { Vector3 } from "three";

export type GenomicCoordinates = {
    start: number;
    end: number;
};

export type ChromatinPart = {
    bins: Vector3[];
    coordinates: GenomicCoordinates;
    resolution: number;
    label?: string; //~ placeholder for determining some semantics of this part (e.g., chromosome, gene location)
};

// The idea is that you want to have completely anonymous parts, too
// for when you don't have any other identifying data about the bins.
export type ChromatinChunk = {
    bins: Vector3[];
};

export type ChromatinModel = {
    parts: ChromatinPart[];
    position: Vector3;
}

/**
 * Query for bin positions on specified genomic coordinates
 * @param coordinates 
 * @returns chromatin part, i.e., list of bin positions corresponding to the genomic coordinates
 */
export function getRange(model: ChromatinModel, coordinates: string): ChromatinPart | null {

    return null;
}
