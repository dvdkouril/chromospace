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
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  ChromatinChunk,
  ChromatinScene,
  ChromatinModel,
  Selection,
  ChromatinModelDisplayable,
} from "../chromatin-types";
import {
  estimateBestSphereSize,
  flattenAllBins,
  computeTubes,
  decideColor,
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

  //~ dom
  redrawRequest: number = 0;

  alwaysRedraw: boolean = false;

  // constructor(canvas: HTMLCanvasElement | undefined = undefined) {
  constructor(
    params?: {
      canvas?: HTMLCanvasElement;
      alwaysRedraw?: boolean;
    }) {
    
    const {
      canvas = undefined,
      alwaysRedraw = true,
    } = params || {};

    this.renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
    // this.renderer = new WebGLRenderer({
    //   powerPreference: "high-performance",
    //   antialias: false,
    //   stencil: false,
    //   depth: false,
    //   canvas });
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
    // this.composer.addPass(new EffectPass(this.camera, new BloomEffect()));
    this.composer.addPass(new EffectPass(this.camera, new BloomEffect()));

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

    type ModelConfig = {
      coloring: "constant" | "scale";
      binSizeScale: number;
      selections: Selection[];
    };
    // if (!config) {
      // config = {
      const config: ModelConfig = {
        coloring: "constant",
        binSizeScale: 1.0,
        selections: [],
      };
    // }
    
    const colorScale = chroma.scale([
      "white",
      "rgba(245,166,35,1.0)",
      "rgba(208,2,27,1.0)",
      "black",
    ]);

    //~ "anonymous" chunks
    this.addChunks(scene.chunks, colorScale, config);

    //~ complete models
    this.addModels(scene.models, colorScale, config);

    //~ "displayables" (model + viewConfig)
    this.addDisplayables(scene.displayables, colorScale);
  }

  addDisplayables(displayables: ChromatinModelDisplayable[], colorScale: ChromaScale<ChromaColor>) {

    //~ todo: better
    const chunkColors = [...Array(256).keys()].map((_) => chroma.random());

    const hasSelection = displayables.some((d) => d.viewConfig.selections.length > 0);
    const deemphasizedColor = chroma("#a3a3a3");

    for (let d of displayables) {
      /* Same as with normal model: make each part into a "model" to render */
      for (let [i, part] of d.structure.parts.entries()) {
        if (d.viewConfig.coloring == "constant") {
          //~ A) constant colors for each model part
          const decideColor = hasSelection ? deemphasizedColor : chunkColors[i];
          this.buildPart(part.chunk, decideColor, undefined);
        } else if (d.viewConfig.coloring == "scale") {
          //~ B) color scale for each part
          if (hasSelection) {
            this.buildPart(part.chunk, deemphasizedColor, undefined);
          } else {
            this.buildPart(part.chunk, undefined, colorScale);
          }
        }
      }
      /* Extra: indicate selections:
       * For now I just draw a somewhat bigger mark "over" the basic structure.
       * In the future, it would be great to either generate the individual parts (selected vs. not selected)
       * and render those.
       * */
      for (let sel of d.viewConfig.selections) {
        for (let r of sel.regions) {
          const selectedPart = get(d.structure, `${r.chromosome}:${r.start}-${r.end}`);
          if (selectedPart) {
            this.buildPart(selectedPart.chunk, chroma("#FF0000"), undefined, d.viewConfig.binSizeScale);
          }
        }
      }
    }
  }

  addChunks(chunks: ChromatinChunk[], colorScale: ChromaScale<ChromaColor>, config: {
        coloring: "constant" | "scale";
        binSizeScale: number;
        selections: Selection[];
      }) {

    const chunkColors = chunks.map((_) => chroma.random());
    for (let [i, chunk] of chunks.entries()) {
      if (config.coloring == "constant") {
        //~ A) setting a constant color for whole chunk
        this.buildPart(chunk, chunkColors[i]);
      } else if (config.coloring == "scale") {
        //~ B) using a color scale with the bin index as lookup
        this.buildPart(chunk, undefined, colorScale);
      }
    }
  }

  addModels(models: ChromatinModel[], colorScale: ChromaScale<ChromaColor>, config: {
        coloring: "constant" | "scale";
        binSizeScale: number;
        selections: Selection[];
      }) {
    //~ complete models
    for (let model of models) {
      const needColorsN = model.parts.length;
      const customCubeHelix = chroma
        .cubehelix()
        .start(200)
        .rotations(-0.8)
        .gamma(0.8)
        .lightness([0.3, 0.8]);
      const chunkColors = customCubeHelix.scale().colors(needColorsN, null);
      const allBins = flattenAllBins(model.parts.map((p) => p.chunk));
      // const sphereSize = estimateBestSphereSize(allBins);
      const sphereSize = estimateBestSphereSize(allBins) * 10;
      for (let [i, part] of model.parts.entries()) {
        if (config.coloring == "constant") {
          //~ A) constant colors for each model part
          this.buildPart(part.chunk, chunkColors[i], undefined, sphereSize);
        } else if (config.coloring == "scale") {
          //~ B) color scale for each part
          this.buildPart(part.chunk, undefined, colorScale, sphereSize);
        }
      }
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
    // if (this.config) {
    //   sphereRadius *= this.config.binSizeScale || 1.0;
    // }
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

    this.renderer.render(this.scene, this.camera);
    // this.composer.render();
  }
}
