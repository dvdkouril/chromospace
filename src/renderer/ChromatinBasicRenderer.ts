// @ts-ignore
import { N8AOPostPass } from "n8ao";
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from "postprocessing";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  decideVisualParametersBasedOn1DData,
  estimateBestSphereSize,
} from "../utils";
import { computeTubes, decideGeometry } from "./render-utils";
import type { DrawableMarkSegment } from "./renderer-types";

import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import type { vec3 } from "gl-matrix";

/**
 * Basic implementation of a 3d chromatin renderer. Essentially just wraps THREE.WebGLRenderer but provides semantics for building chromatin visualization.
 *
 * Important methods:
 *  - addSegments: adding segments of chromatin with unified visual properties (e.g., specified by a grammar)
 *  - buildStructures, buildPart: turns segments with specific visual attributes into THREE primitives
 */
export class ChromatinBasicRenderer {
  markSegments: DrawableMarkSegment[] = [];

  //~ threejs stuff
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  composer: EffectComposer;
  ssaoPasses: [N8AOPostPass, N8AOPostPass];
  meshes: THREE.InstancedMesh[] = [];

  hoveredIndicator: THREE.Mesh;

  //~ dom
  redrawRequest = 0;
  updateCallback: ((text: string) => void) | undefined;

  alwaysRedraw = false;

  //~ interactions
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2( 1, 1 );
  /* returns a tuple of [segment index, bin index] of hovered bin */
  hoveredBinId: [number, number] | undefined = undefined;

  constructor(params?: {
    canvas?: HTMLCanvasElement;
    alwaysRedraw?: boolean;
  }) {
    const { canvas = undefined, alwaysRedraw = true } = params || {};

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
      alpha: true,
      premultipliedAlpha: false,
      canvas,
    });
    // this.renderer.setClearColor("#00eeee");
    this.renderer.setClearAlpha(0.0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(25, 2, 0.1, 1000);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.z = 3.0;
    controls.update();

    const lightA = new THREE.DirectionalLight();
    lightA.position.set(3, 10, 10);
    lightA.castShadow = true;
    const lightB = new THREE.DirectionalLight();
    lightB.position.set(-3, 10, -10);
    lightB.intensity = 0.2;
    const lightC = new THREE.AmbientLight();
    lightC.intensity = 0.2;
    this.scene.add(lightA, lightB, lightC);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // N8AOPass replaces RenderPass
    const w = 1920;
    const h = 1080;
    const n8aopass = new N8AOPostPass(this.scene, this.camera, w, h);
    n8aopass.configuration.aoRadius = 0.1;
    n8aopass.configuration.distanceFalloff = 1.0;
    n8aopass.configuration.intensity = 2.0;
    this.composer.addPass(n8aopass);

    const n8aopassBigger = new N8AOPostPass(this.scene, this.camera, w, h);
    n8aopassBigger.configuration.aoRadius = 1.0;
    n8aopassBigger.configuration.distanceFalloff = 1.0;
    n8aopassBigger.configuration.intensity = 2.0;
    this.composer.addPass(n8aopass);

    this.ssaoPasses = [n8aopass, n8aopassBigger];

    /* SMAA Recommended */
    this.composer.addPass(
      new EffectPass(
        this.camera,
        new SMAAEffect({
          preset: SMAAPreset.ULTRA,
        }),
      ),
    );

    //~ hovered indicator
    const a = 0.02;
    const indicatorGeom = new THREE.BoxGeometry(a, a, a);
    const m = new THREE.MeshBasicMaterial({ color: "#000000" });
    m.wireframe = true;
    this.hoveredIndicator = new THREE.Mesh(indicatorGeom, m);
    this.hoveredIndicator.position.set(0, 0, 0);
    this.scene.add(this.hoveredIndicator);

    this.render = this.render.bind(this);
    this.update = this.update.bind(this);
    this.getCanvasElement = this.getCanvasElement.bind(this);
    this.startDrawing = this.startDrawing.bind(this);
    this.endDrawing = this.endDrawing.bind(this);
    this.resizeRendererToDisplaySize =
    this.resizeRendererToDisplaySize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    //~ setting size of canvas to fill parent
    const c = this.getCanvasElement();
    c.style.width = "100%";
    c.style.height = "100%";

    this.alwaysRedraw = alwaysRedraw;
    if (!alwaysRedraw) {
      controls.addEventListener("change", this.render);
    }
    document.addEventListener( 'mousemove', this.onMouseMove );
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * Returns a pair [segment id, bin id] to identify hovered bin
   */
  getHoveredBin(): [number, number] | undefined {
    return this.hoveredBinId;
  }

  addUpdateHUDCallback(cb: (text: string) => void) {
    this.updateCallback = cb;
  }

  /**
   * Entrypoint for adding actual data to show
   */
  addSegments(newSegments: DrawableMarkSegment[]) {
    this.markSegments = [...this.markSegments, ...newSegments];
    this.buildStructures();
  }

  /**
   * Turns all drawable segments into THREE objects to be rendered
   */
  buildStructures() {
    this.scene.clear();
    for (const segment of this.markSegments) {
      this.buildPart(segment);
    }
  }

  /**
   * Meant to be called directly from client (eg, Observable notebook) to request redraw
   */
  updateViewConfig() {
    this.scene.clear();
    this.buildStructures();
    this.redrawRequest = requestAnimationFrame(this.render);
  }

  /**
   * Turns a singular segment (ie, position+mark+attributes) into THREEjs objects for rendering
   */
  buildPart(segment: DrawableMarkSegment) {
    const {
      color, //TODO: these don't make sense now to be undefined eveer
      // size = undefined,
      makeLinks = true,
    } = segment.attributes;

    const sphereRadius = estimateBestSphereSize(segment.positions);

    //~ make the threejs objects
    const g = decideGeometry(segment.mark);
    const m = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });
    const n = segment.positions.length;
    const meshInstcedSpheres = new THREE.InstancedMesh(g, m, n);
    const dummyObj = new THREE.Object3D();

    //~ iterating over bins in the current segment
    for (const [i, b] of segment.positions.entries()) {
      const [colorOfThisBin, scaleOfThisBin] =
        decideVisualParametersBasedOn1DData(segment, i);

      dummyObj.position.set(b[0], b[1], b[2]);
      dummyObj.scale.setScalar(scaleOfThisBin);
      dummyObj.updateMatrix();
      meshInstcedSpheres.setMatrixAt(i, dummyObj.matrix);
      meshInstcedSpheres.setColorAt(i, colorOfThisBin);
    }
    this.scene.add(meshInstcedSpheres);
    this.meshes.push(meshInstcedSpheres);

    if (makeLinks) {
      const tubeSize = 0.4 * sphereRadius;
      this.buildLinks(segment.positions, tubeSize, color);
    }
  }

  /**
   * Utility function for building links between marks (optional)
   */
  buildLinks(
    positions: vec3[],
    tubeSize: number,
    color: ChromaColor | ChromaColor[],
  ) {
    //~ tubes between tubes
    const tubes = computeTubes(positions);
    const tubeGeometry = new THREE.CylinderGeometry(
      tubeSize,
      tubeSize,
      1.0,
      10,
      1,
    );
    const material = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });

    const meshInstcedTubes = new THREE.InstancedMesh(
      tubeGeometry,
      material,
      tubes.length,
    );

    const dummyObj = new THREE.Object3D();
    const colorObj = new THREE.Color();
    for (const [i, tube] of tubes.entries()) {
      dummyObj.position.set(tube.position.x, tube.position.y, tube.position.z);
      dummyObj.rotation.set(
        tube.rotation.x,
        tube.rotation.y,
        tube.rotation.z,
        tube.rotation.order,
      );
      dummyObj.scale.setY(tube.scale);
      dummyObj.updateMatrix();

      //~ narrowing: ChromaColor or ChromaColor[]
      if (Array.isArray(color)) {
        colorObj.set(color[i].hex());
        color;
      } else {
        colorObj.set(color.hex());
      }

      meshInstcedTubes.setMatrixAt(i, dummyObj.matrix);
      meshInstcedTubes.setColorAt(i, colorObj);
    }
    this.scene.add(meshInstcedTubes);
  }

  updateColor(meshIndex: number, color: ChromaColor | ChromaColor[]) {
    const mesh = this.meshes[meshIndex];
    const colorObj = new THREE.Color();

    for (let i = 0; i < mesh.count; i++) {
      //~ narrowing: ChromaColor or ChromaColor[]
      if (Array.isArray(color)) {
        colorObj.set(color[i].hex());
      } else {
        colorObj.set(color.hex());
      }
      mesh.setColorAt(i, colorObj);
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }
  }

  startDrawing() {
    this.redrawRequest = requestAnimationFrame(this.render);
  }

  endDrawing() {
    cancelAnimationFrame(this.redrawRequest);
    this.renderer.dispose();
  }

  resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer): boolean {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      this.composer.setSize(width, height);
      const [pass1, pass2] = this.ssaoPasses;
      pass1.setSize(width, height);
      pass2.setSize(width, height);
    }
    return needResize;
  }

  update() {
    this.raycaster.setFromCamera( this.mouse, this.camera );

    for (let [i, m] of this.meshes.entries()) {
      const intersection = this.raycaster.intersectObject( m);
      this.hoveredBinId = undefined;
      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId;
        if (instanceId) {
          this.hoveredBinId = [i, instanceId];
          if (this.updateCallback) {
            this.updateCallback("Hovered: " + i + ", " + instanceId);
          }
        }
      }
    }

    // animate indicator
    this.hoveredIndicator.rotateX(0.01 * 1.0);
    this.hoveredIndicator.rotateY(0.01 * 1.0);
    this.hoveredIndicator.rotateZ(0.01 * 1.0);
    if (this.hoveredBinId) {
      const mat = new THREE.Matrix4();
      const [segmentId, binId] = this.hoveredBinId;
      this.meshes[segmentId].getMatrixAt(binId, mat);
      const pos = new THREE.Vector3();
      mat.decompose(pos, new THREE.Quaternion(), new THREE.Vector3());
      this.hoveredIndicator.position.set(pos.x, pos.y, pos.z);
    }

    //~ color neighboring sequence
    if (this.hoveredBinId) {
      const [segmentId, binId] = this.hoveredBinId;
      const segment = this.markSegments[segmentId];
      segment.attributes.color = chroma("blue");

      const min = -100;
      const max = 100;
      // const colorScale = chroma.scale(['yellow', '008ae5']);
      const colorScale = chroma.scale(['yellow', 'red', 'yellow']);
      const N = segment.positions.length;
      // const colorScale = chroma.scale(vc.color.colorScale);
      const indices = Array.from({ length: N + 1 }, (_, i) => i - binId);
      const color = indices.map((v) => colorScale.domain([min, max])(v));
      // color = vc.color.values.map((v) => colorScale.domain([min, max])(v));

      // this.updateColor(segmentId, chroma("blue"));
      this.updateColor(segmentId, color);

      // this.scene.clear();
      // this.buildStructures();
    }
  }

  render() {
    if (this.alwaysRedraw) {
      this.redrawRequest = requestAnimationFrame(this.render);
    }

    // console.log("drawing");

    this.update();
    // console.log("hovered bin:" + this.hoveredBinId);

    //~ from: https://threejs.org/manual/#en/responsive
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.composer.render();
  }

  onMouseMove(event: MouseEvent) {
    event.preventDefault();
    const canvas = this.renderer.domElement;

    /* deal with canvas that's offset, not fullscreen */
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.x);
    const y = (event.clientY - rect.y);

    /* mouse.x/y should be both in <-1,1> */
    this.mouse.x = (x / rect.width) * 2 - 1;
    this.mouse.y = - (y / rect.height) * 2 + 1;
  }
}
