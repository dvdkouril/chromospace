import * as THREE from "three";
import { vec3 } from "gl-matrix";
import type { MarkTypes } from "../chromatin-types";
import type { VisualAttributes } from "./renderer-types";

export const decideGeometry = (
  mark: MarkTypes,
  attributes: VisualAttributes,
):
  | THREE.SphereGeometry
  | THREE.BoxGeometry
  | THREE.OctahedronGeometry
  | undefined => {
  switch (mark) {
    case "sphere":
      return new THREE.SphereGeometry(attributes.size);
    case "box":
      return new THREE.BoxGeometry(
        attributes.size,
        attributes.size,
        attributes.size,
      );
    case "octahedron":
      return new THREE.OctahedronGeometry(attributes.size);
    default:
      return undefined;
  }
};

export const computeTubes = (
  bins: vec3[],
): { position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] => {
  const t: { position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] = [];
  for (let i = 0; i < bins.length - 1; i++) {
    const first = new THREE.Vector3(bins[i][0], bins[i][1], bins[i][2]);
    const second = new THREE.Vector3(bins[i + 1][0], bins[i + 1][1], bins[i + 1][2]);

    //~ position between the two bins
    const pos = new THREE.Vector3();
    pos.subVectors(second, first);
    pos.divideScalar(2);
    pos.addVectors(first, pos);
    const tubePosition = pos;
    //~ rotation
    const tubeRotation = getRotationFromTwoPositions(first, second);
    //~ tube length
    const betweenVec = new THREE.Vector3();
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

const getRotationFromTwoPositions = (from: THREE.Vector3, to: THREE.Vector3) => {
  const fromCopy = new THREE.Vector3(from.x, from.y, from.z);
  const toCopy = new THREE.Vector3(to.x, to.y, to.z);
  const q = new THREE.Quaternion();
  const u = new THREE.Vector3(0, 1, 0);
  const v = toCopy.sub(fromCopy).normalize();

  q.setFromUnitVectors(u, v);

  const eulers = new THREE.Euler();
  return eulers.setFromQuaternion(q);
};
