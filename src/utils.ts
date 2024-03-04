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

export const estimateBestSphereSize = (bins: vec3[]): number => {
    if (bins.length < 2) {
        return 1.0;
    }

    const distances: number[] = [];
    for (let i = 0; i < bins.length - 1; i++) {
        const curr = bins[i];
        const next = bins[i + 1];
        const dist = vec3.distance(curr, next);
        distances.push(dist);
    }
    const minDist = Math.min(...distances);

    //~ TODO: maybe something more sophisticated like in chromoskein: https://github.com/chromoskein/chromoskein/blob/196cc28821924965392f37a1921c9aa2ee7ffeff/app/src/components/RightPanel/ChromatinViewportConfigurationPanel.tsx#L262
    return 0.4 * minDist;
};
