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
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ChromatinChunk, ChromatinScene, ChromatinSceneConfig } from "../chromatin-types";
import {
  estimateBestSphereSize,
  flattenAllBins,
  computeTubes,
  decideColor,
} from "../utils";

import type { Color as ChromaColor, Scale as ChromaScale } from 'chroma-js';
import chroma from "chroma-js";

export class ChromatinBasicRenderer {
  chromatinScene: ChromatinScene | undefined;
  config: ChromatinSceneConfig | undefined;

  //~ threejs stuff
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  composer: EffectComposer;

  //~ dom
  redrawRequest: number = 0;

  constructor(canvas: HTMLCanvasElement | undefined = undefined) {
    this.renderer = new WebGLRenderer({ antialias: true, canvas });
    // this.renderer = new WebGLRenderer({ 
    //   powerPreference: "high-performance",
    //   antialias: false, 
    //   stencil: false,
    //   depth: false,
    //   canvas });
    this.renderer.setClearColor("#eeeeee");
    this.renderer.setSize(800, 600);
    this.scene = new Scene();
    // camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera = new PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.z = 1.0;
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
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  addScene(scene: ChromatinScene, config?: ChromatinSceneConfig) {
    this.chromatinScene = scene;
    this.config = config;

    if (!config) {
      config = {
        coloring: "constant",
        binSizeScale: 1.0,
      };
    }


    //~ "anonymous" chunks
    const chunkColors = scene.chunks.map(_ => chroma.random() );
    const colorScale = chroma.scale(['white', 'rgba(245,166,35,1.0)', 'rgba(208,2,27,1.0)', 'black']);
    for (let [i, chunk] of scene.chunks.entries()) {
      if (config.coloring == "constant") {
        //~ A) setting a constant color for whole chunk
        this.buildPart(chunk, chunkColors[i]);
      } else if (config.coloring == "scale") {
        //~ B) using a color scale with the bin index as lookup
        this.buildPart(chunk, undefined, colorScale);
      }
    }

    //~ complete models
    for (let model of scene.models) {
      const chunkColors = model.parts.map(_ => chroma.random() );
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

  buildPart(chunk: ChromatinChunk, color?: ChromaColor, colorMap?: ChromaScale, sphereSize?: number) {
    let sphereRadius = sphereSize
      ? sphereSize
      : estimateBestSphereSize(chunk.bins);
    if (this.config) {
      sphereRadius *= this.config.binSizeScale || 1.0;
    }
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

  render() {
    this.redrawRequest = requestAnimationFrame(this.render);

    console.log("drawing");

    this.renderer.render(this.scene, this.camera);
    // this.composer.render();
  }
}
