import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  InstancedMesh,
  SphereGeometry,
  CylinderGeometry,
  DirectionalLight,
  AmbientLight,
  MeshBasicMaterial,
  Color,
} from "three";
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from "postprocessing";
// @ts-ignore
import {N8AOPostPass} from "n8ao";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  ChromatinChunk,
  ChromatinScene,
  DisplayableChunk,
  DisplayableModel,
} from "../chromatin-types";
import {
  estimateBestSphereSize,
  computeTubes,
  decideColor,
  decideVisualParameters,
  customCubeHelix,
  defaultColorScale,
} from "../utils";

import type { Color as ChromaColor, Scale as ChromaScale } from "chroma-js";
import chroma from "chroma-js";
import { get } from "../chromatin";

export class ChromatinBasicRenderer {
  chromatinScene: ChromatinScene | undefined;

  //~ threejs stuff
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  composer: EffectComposer;
  ssaoPasses: [N8AOPostPass, N8AOPostPass];

  //~ dom
  redrawRequest: number = 0;

  alwaysRedraw: boolean = false;

  constructor(
    params?: {
      canvas?: HTMLCanvasElement;
      alwaysRedraw?: boolean;
    }) {
    
    const {
      canvas = undefined,
      alwaysRedraw = true,
    } = params || {};

    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
      canvas });
    this.renderer.setClearColor("#eeeeee");
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(25, 2, 0.1, 1000);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.z = 3.0;
    controls.update();


    const lightA = new DirectionalLight();
    lightA.position.set(3, 10, 10);
    lightA.castShadow = true;
    const lightB = new DirectionalLight();
    lightB.position.set(-3, 10, -10);
    lightB.intensity = 0.2;
    const lightC = new AmbientLight();
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
    this.composer.addPass(new EffectPass(this.camera, new SMAAEffect({
        preset: SMAAPreset.ULTRA
    })));

    this.render = this.render.bind(this);
    this.getCanvasElement = this.getCanvasElement.bind(this);
    this.startDrawing = this.startDrawing.bind(this);
    this.endDrawing = this.endDrawing.bind(this);
    this.resizeRendererToDisplaySize = this.resizeRendererToDisplaySize.bind(this);

    //~ setting size of canvas to fill parent
    const c = this.getCanvasElement();
    c.style.width = '100%';
    c.style.height = '100%';

    this.alwaysRedraw = alwaysRedraw;
    if (!alwaysRedraw) {
      controls.addEventListener('change', this.render);
    }
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  addScene(scene: ChromatinScene) {
    this.chromatinScene = scene;
    this.buildStructures(scene.structures);
  }

  updateViewConfig() {
    if (this.chromatinScene) {
      this.scene.clear();
      this.buildStructures(this.chromatinScene.structures);
      this.redrawRequest = requestAnimationFrame(this.render);
    }
  }

  buildStructures(structures: (DisplayableChunk | DisplayableModel)[]) {
    for (let s of structures) {
      switch (s.kind) {
        case "model":
          this.buildDisplayableModel(s);
          break;
        case "chunk":
          this.buildDisplayableChunk(s);
          break;
      }
    }
  }

  buildDisplayableModel(model: DisplayableModel) {
    const hasSelection = model.viewConfig.selections.length > 0;
    /* First: Build the whole model */
    for (let [i, part] of model.structure.parts.entries()) {
      const n = model.structure.parts.length;
      const [singleColor, colorScale, sphereSize] = decideVisualParameters(model.viewConfig, i, n);
      //~ this is a hack: should go inside (?) the decider func above
      if (hasSelection) {
        this.buildPart(part.chunk, chroma("#a3a3a3"), undefined, 0.001); //TODO: unnecessary single import of whole chroma
      } else {
        this.buildPart(part.chunk, singleColor, colorScale, sphereSize);
      }
    }

    /* Second: Indicate selections (if any) */
    // const needColorsN = model.viewConfig.selections.length;
    // const chunkColors = customCubeHelix.scale().colors(needColorsN, null);
    for (let sel of model.viewConfig.selections.values()) {
      const randColor  = customCubeHelix.scale().colors(256, null)[Math.floor(Math.random() * 255)];
      let color = randColor;
      if (model.viewConfig.color) { //~ override color if supplied
        color = chroma(model.viewConfig.color);
      }
      for (let r of sel.regions) {
        const result = get(model.structure, `${r.chromosome}:${r.start}-${r.end}`);
        if (result) {
          const [selectedPart, _] = result;
          if (selectedPart) {
            this.buildPart(selectedPart.chunk, color, undefined, model.viewConfig.binSizeScale);
          }
        }
      }
    }
  }

  /*
   * chunk options:
   * - custom color
   * - generate color for me
   * - custom scale
   * - default scale
  */
  buildDisplayableChunk(chunk: DisplayableChunk) {
    if (chunk.viewConfig.coloring == "constant") {
      //~ A) setting a constant color for whole chunk
      const randColor  = customCubeHelix.scale().colors(256, null)[Math.floor(Math.random() * 255)];
      let color = randColor;
      if (chunk.viewConfig.color) { //~ override color if supplied
        color = chroma(chunk.viewConfig.color);
      }
      this.buildPart(chunk.structure, color);
    } else if (chunk.viewConfig.coloring == "scale") {
      //~ B) using a color scale with the bin index as lookup
      this.buildPart(chunk.structure, undefined, defaultColorScale);
    }
  }

  buildPart(
    chunk: ChromatinChunk,
    color?: ChromaColor,
    colorMap?: ChromaScale,
    sphereSize?: number,
  ) {
    let sphereRadius = sphereSize
      ? sphereSize
      : estimateBestSphereSize(chunk.bins);
    const tubeSize = 0.4 * sphereRadius;
    const sphereGeometry = new SphereGeometry(sphereRadius);
    const tubeGeometry = new CylinderGeometry(tubeSize, tubeSize, 1.0, 10, 1);
    const material = new MeshBasicMaterial({ color: "#FFFFFF" });

    //~ bin spheres
    const meshInstcedSpheres = new InstancedMesh(
      sphereGeometry,
      material,
      chunk.bins.length,
    );
    const dummyObj = new Object3D();
    const colorObj = new Color();

    for (let [i, b] of chunk.bins.entries()) {
      dummyObj.position.set(b[0], b[1], b[2]);
      dummyObj.updateMatrix();
      meshInstcedSpheres.setMatrixAt(i, dummyObj.matrix);

      decideColor(colorObj, i, chunk.bins.length, color, colorMap);
      meshInstcedSpheres.setColorAt(i, colorObj);
      i += 1;
    }
    this.scene.add(meshInstcedSpheres);

    //~ tubes between tubes
    const tubes = computeTubes(chunk.bins);
    const meshInstcedTubes = new InstancedMesh(
      tubeGeometry,
      material,
      tubes.length,
    );
    for (let [i, tube] of tubes.entries()) {
      dummyObj.position.set(tube.position.x, tube.position.y, tube.position.z);
      dummyObj.rotation.set(
        tube.rotation.x,
        tube.rotation.y,
        tube.rotation.z,
        tube.rotation.order,
      );
      dummyObj.scale.setY(tube.scale);
      dummyObj.updateMatrix();
      meshInstcedTubes.setMatrixAt(i, dummyObj.matrix);

      decideColor(colorObj, i, chunk.bins.length, color, colorMap);
      meshInstcedTubes.setColorAt(i, colorObj);
    }
    this.scene.add(meshInstcedTubes);
  }

  startDrawing() {
    this.redrawRequest = requestAnimationFrame(this.render);
  }

  endDrawing() {
    cancelAnimationFrame(this.redrawRequest);
    this.renderer.dispose();
  }

  resizeRendererToDisplaySize(renderer: WebGLRenderer) {
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

  render() {
    if (this.alwaysRedraw) {
      this.redrawRequest = requestAnimationFrame(this.render);
    }

    console.log("drawing");

    //~ from: https://threejs.org/manual/#en/responsive
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.composer.render();
  }
}
