interface GenomicCoordinates {
    start: number;
    end: number;
};

export interface ChromatinPart {
    coordinates: GenomicCoordinates;
    bins: number[];
    resolution: number;
    annotation?: string; //~ placeholder for determining some semantics of this part (e.g., chromosome, gene location)
};

export interface ChromatinModel {
    parts: ChromatinPart[];


}

/**
 * Query for bin positions on specified genomic coordinates
 * @param coordinates 
 * @returns chromatin part, i.e., list of bin positions corresponding to the genomic coordinates
 */
export function getRange(model: ChromatinModel, coordinates: string): ChromatinPart | null {
    return null;
}