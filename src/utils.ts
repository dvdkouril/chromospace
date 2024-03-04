import { vec3 } from 'gl-matrix';

export const recenter = (
    originalPositions: vec3[]
): vec3[] => {
    const positions = originalPositions;

    const bbMax = positions.reduce(
        (a, b) => vec3.max(vec3.create(), a, b),
        vec3.fromValues(
            Number.MIN_VALUE,
            Number.MIN_VALUE,
            Number.MIN_VALUE
        )
    );
    const bbMin = positions.reduce(
        (a, b) => vec3.min(vec3.create(), a, b),
        vec3.fromValues(
            Number.MAX_VALUE,
            Number.MAX_VALUE,
            Number.MAX_VALUE
        )
    );
    const bbCenter = vec3.scale(
        vec3.create(),
        vec3.add(vec3.create(), bbMax, bbMin),
        0.5
    );
    const bbSides = vec3.sub(vec3.create(), bbMax, bbMin);
    bbSides.forEach((v: number) => Math.abs(v));
    
    const positionsCentered = positions.map((a) =>
        vec3.sub(vec3.create(), a, bbCenter)
    );

    return positionsCentered;
};

export const normalize = (positions: vec3[]): vec3[] => {
    const bbMax = positions.reduce(
        (a, b) => vec3.max(vec3.create(), a, b),
        vec3.fromValues(
            Number.MIN_VALUE,
            Number.MIN_VALUE,
            Number.MIN_VALUE
        )
    );
    const bbMin = positions.reduce(
        (a, b) => vec3.min(vec3.create(), a, b),
        vec3.fromValues(
            Number.MAX_VALUE,
            Number.MAX_VALUE,
            Number.MAX_VALUE
        )
    );
    const bbCenter = vec3.scale(
        vec3.create(),
        vec3.add(vec3.create(), bbMax, bbMin),
        0.5
    );
    console.log(bbCenter);
    const bbSides = vec3.sub(vec3.create(), bbMax, bbMin);
    const maxDim = Math.max(...bbSides);
    const scaleFactor = 1 / maxDim;

    const positionsNormalized = positions.map(p => vec3.scale(p, p, scaleFactor));

    return positionsNormalized;
};
