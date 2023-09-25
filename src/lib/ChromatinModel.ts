interface GenomicCoordinates {
    start: number;
    end: number;
};

interface ChromatinPart {
    coordinates: GenomicCoordinates;
    bins: number[];
    resolution: number;
    annotation?: string; //~ placeholder for determining some semantics of this part (e.g., chromosome, gene location)
};

interface ChromatinModel {
    parts: ChromatinPart[];
}