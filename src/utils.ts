import { vec3 } from "gl-matrix";
import { ChromatinChunk } from "./chromatin";
import { Vector3, Euler, Quaternion } from "three";

export const glasbeyColors = [
  "#d21820",
  "#1869ff",
  "#008a00",
  "#f36dff",
  "#710079",
  "#aafb00",
  "#00bec2",
  "#ffa235",
  "#5d3d04",
  "#08008a",
  "#005d5d",
  "#9a7d82",
  "#a2aeff",
  "#96b675",
  "#9e28ff",
  "#4d0014",
  "#ffaebe",
  "#ce0092",
  "#00ffb6",
  "#002d00",
  "#9e7500",
  "#3d3541",
  "#f3eb92",
  "#65618a",
  "#8a3d4d",
  "#5904ba",
  "#558a71",
  "#b2bec2",
  "#ff5d82",
  "#1cc600",
  "#92f7ff",
  "#2d86a6",
  "#395d28",
  "#ebceff",
  "#ff5d00",
  "#a661aa",
  "#860000",
  "#350059",
  "#00518e",
  "#9e4910",
  "#cebe00",
  "#002828",
  "#00b2ff",
  "#caa686",
  "#be9ac2",
  "#2d200c",
  "#756545",
  "#8279df",
  "#00c28a",
  "#bae7c2",
  "#868ea6",
  "#ca7159",
  "#829a00",
  "#2d00ff",
  "#d204f7",
  "#ffd7be",
  "#92cef7",
  "#ba5d7d",
  "#ff41c2",
  "#be86ff",
  "#928e65",
  "#a604aa",
  "#86e375",
  "#49003d",
  "#fbef0c",
  "#69555d",
  "#59312d",
  "#6935ff",
  "#b6044d",
  "#5d6d71",
  "#414535",
  "#657100",
  "#790049",
  "#1c3151",
  "#79419e",
  "#ff9271",
  "#ffa6f3",
  "#ba9e41",
  "#82aa9a",
  "#d77900",
  "#493d71",
  "#51a255",
  "#e782b6",
  "#d2e3fb",
  "#004931",
  "#6ddbc2",
  "#3d4d5d",
  "#613555",
  "#007151",
  "#5d1800",
  "#9a5d51",
  "#558edb",
  "#caca9a",
  "#351820",
  "#393d00",
  "#009a96",
  "#eb106d",
  "#8a4579",
  "#75aac2",
  "#ca929a",
  "#d2bac6",
  "#9ace00",
  "#456daa",
  "#755900",
  "#ce4d0c",
  "#00dffb",
  "#ff3d41",
  "#ffca49",
  "#2d3192",
  "#866986",
  "#9e82be",
  "#ceaeff",
  "#79452d",
  "#c6fb82",
  "#5d7549",
  "#b64549",
  "#ffdfef",
  "#a20071",
  "#4d4da6",
  "#a6aaca",
  "#711c28",
  "#287979",
  "#084900",
  "#006986",
  "#a67549",
  "#fbb682",
  "#55187d",
  "#00ff59",
  "#00414d",
  "#6d8e92",
  "#aa2400",
  "#bed26d",
  "#8a61ba",
  "#d241be",
  "#496151",
  "#cef3ef",
  "#61c261",
  "#148a4d",
  "#00ffe7",
  "#006900",
  "#b2799e",
  "#aab29e",
  "#ba55ff",
  "#c679ce",
  "#203120",
  "#7d04db",
  "#c2c6f7",
  "#8ac6ce",
  "#e7ebce",
  "#281c39",
  "#9effae",
  "#82ce9a",
  "#31a60c",
  "#00a275",
  "#db9255",
  "#3d1404",
  "#ff8a9a",
  "#828635",
  "#694d71",
  "#b66100",
  "#7d2d00",
  "#a2b239",
  "#31047d",
  "#a63dca",
  "#9a202d",
  "#04df86",
  "#757d6d",
  "#8a96d2",
  "#08a2ca",
  "#f76d5d",
  "#1055ca",
  "#dbb665",
  "#92596d",
  "#a2ffe3",
  "#595528",
  "#7179aa",
  "#d75965",
  "#492051",
  "#df4d92",
  "#0000ca",
  "#5d65d2",
  "#dfa600",
  "#b24992",
  "#b68a75",
  "#614d3d",
  "#a696a2",
  "#551c35",
  "#314141",
  "#757586",
  "#929ea2",
  "#759a71",
  "#ff8220",
  "#8655ff",
  "#9ac6b6",
  "#df96f3",
  "#cadf31",
  "#8e5d28",
  "#35bee3",
  "#71a6ff",
  "#598a31",
  "#ffc2eb",
  "#aa3d69",
  "#49617d",
  "#49351c",
  "#45b29e",
  "#1c2431",
  "#f731ef",
  "#7500a6",
  "#e7b6aa",
  "#826965",
  "#e3a2ca",
  "#202400",
  "#79b610",
  "#9e8eff",
  "#d2758a",
  "#cab6db",
  "#ae9adf",
  "#ff71db",
  "#d2f7b2",
  "#c6d7ce",
  "#ffd28a",
  "#5ddf35",
  "#5d7992",
  "#a28e00",
  "#aedfef",
  "#714dc2",
  "#7d4500",
  "#6592b6",
  "#5d79ff",
  "#514959",
  "#969e51",
  "#ce69ae",
  "#653575",
  "#dbd2e3",
  "#b6ae75",
  "#515900",
  "#b65939",
  "#5504eb",
  "#3d752d",
  "#92829a",
  "#822469",
  "#ba8639",
  "#8ab2e3",
  "#6db282",
  "#964135",
  "#6d4149",
  "#8a753d",
  "#b27175",
  "#921c49",
  "#df6d31",
  "#00e3df",
  "#9204ca",
  "#312859",
  "#007dd2",
  "#a26dff",
  "#825992",
];

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
