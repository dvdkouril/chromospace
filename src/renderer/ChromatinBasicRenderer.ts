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
  MeshStandardMaterial,
} from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ChromatinChunk, ChromatinScene } from "../chromatin";
import {
  estimateBestSphereSize,
  flattenAllBins,
  computeTubes,
  glasbeyColors,
} from "../utils";

export class ChromatinBasicRenderer {
  chromatinScene: ChromatinScene | undefined;

  //~ threejs stuff
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  composer: EffectComposer;

  //~ utils
  randomColors: string[] = [];

  constructor(canvas: HTMLCanvasElement | undefined = undefined) {
    // this.renderer = new WebGLRenderer({ antialias: true, canvas });
    this.renderer = new WebGLRenderer({ 
      powerPreference: "high-performance",
      antialias: false, 
      stencil: false,
      depth: false,
      canvas });
    this.renderer.setClearColor("#eeeeee");
    this.renderer.setSize(800, 600);
    this.scene = new Scene();
    // camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera = new PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.z = 1.5;
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

    this.randomColors = glasbeyColors;
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  addScene(scene: ChromatinScene) {
    this.chromatinScene = scene;

    //~ "anonymous" chunks
    for (let chunk of scene.chunks) {
      this.buildPart(chunk);
    }

    //~ complete models
    for (let model of scene.models) {
      const allBins = flattenAllBins(model.parts.map((p) => p.chunk));
      // const sphereSize = estimateBestSphereSize(allBins);
      const sphereSize = estimateBestSphereSize(allBins) * 10;
      for (let part of model.parts) {
        this.buildPart(part.chunk, sphereSize);
      }
    }
  }

  buildPart(chunk: ChromatinChunk, sphereSize?: number) {
    const sphereRadius = sphereSize
      ? sphereSize
      : estimateBestSphereSize(chunk.bins);
    const tubeSize = 0.4 * sphereRadius;
    const sphereGeometry = new SphereGeometry(sphereRadius);
    const tubeGeometry = new CylinderGeometry(tubeSize, tubeSize, 1.0, 10, 1);

    const color = this.randomColors[chunk.id];
    console.log("color: " + color);
    const material = new MeshStandardMaterial({ color: color });

    //~ bin spheres
    const meshInstcedSpheres = new InstancedMesh(
      sphereGeometry,
      material,
      chunk.bins.length,
    );
    const dummyObj = new Object3D();
    let i = 0;
    for (let b of chunk.bins) {
      dummyObj.position.set(b[0], b[1], b[2]);
      dummyObj.updateMatrix();
      meshInstcedSpheres.setMatrixAt(i++, dummyObj.matrix);
    }
    this.scene.add(meshInstcedSpheres);

    //~ tubes between tubes
    const tubes = computeTubes(chunk.bins);
    const meshInstcedTubes = new InstancedMesh(
      tubeGeometry,
      material,
      tubes.length,
    );
    i = 0;
    for (let tube of tubes) {
      dummyObj.position.set(tube.position.x, tube.position.y, tube.position.z);
      dummyObj.rotation.set(
        tube.rotation.x,
        tube.rotation.y,
        tube.rotation.z,
        tube.rotation.order,
      );
      dummyObj.scale.setY(tube.scale);
      dummyObj.updateMatrix();
      meshInstcedTubes.setMatrixAt(i++, dummyObj.matrix);
    }
    this.scene.add(meshInstcedTubes);
  }

  startDrawing() {
    requestAnimationFrame(this.render);
  }

  render() {
    requestAnimationFrame(this.render);

    console.log("drawing");

    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}
