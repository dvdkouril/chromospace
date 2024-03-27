import { vec3 } from "gl-matrix";
import { ChromatinChunk } from "./chromatin-types";
import { Vector3, Euler, Quaternion } from "three";

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

export const computeTubes = (
  bins: vec3[],
): { position: Vector3; rotation: Euler; scale: number }[] => {
  const t: { position: Vector3; rotation: Euler; scale: number }[] = [];
  for (let i = 0; i < bins.length - 1; i++) {
    const first = new Vector3(bins[i][0], bins[i][1], bins[i][2]);
    const second = new Vector3(bins[i + 1][0], bins[i + 1][1], bins[i + 1][2]);

    //~ position between the two bins
    const pos = new Vector3();
    pos.subVectors(second, first);
    pos.divideScalar(2);
    pos.addVectors(first, pos);
    const tubePosition = pos;
    //~ rotation
    const tubeRotation = getRotationFromTwoPositions(first, second);
    //~ tube length
    const betweenVec = new Vector3();
    betweenVec.subVectors(second, first);
    const tubeScale = betweenVec.length();

    t.push({
      position: tubePosition,
      rotation: tubeRotation,
      scale: tubeScale,
    });
  }

  return t;
};

const getRotationFromTwoPositions = (from: Vector3, to: Vector3) => {
  const fromCopy = new Vector3(from.x, from.y, from.z);
  const toCopy = new Vector3(to.x, to.y, to.z);
  const q = new Quaternion();
  const u = new Vector3(0, 1, 0);
  const v = toCopy.sub(fromCopy).normalize();

  q.setFromUnitVectors(u, v);

  const eulers = new Euler();
  return eulers.setFromQuaternion(q);
};
