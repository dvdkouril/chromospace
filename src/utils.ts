import { vec3 } from 'gl-matrix';
import { ChromatinChunk } from './chromatin';

export const flattenAllBins = (parts: ChromatinChunk[]): vec3[] => {
    const allBins: vec3[] = parts.reduce((acc: vec3[], curr: ChromatinChunk) => {
      return acc.concat(curr.bins);
    }, []);
    return allBins;
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
