import * as THREE from 'three';
import type { ChromatinScene } from './ChromatinScene';

// import WebGPU from 'three/addons/capabilities/WebGPU.js';
// import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

/**
 * TODO: for later, I might have a basic mesh renderer, using instancing, implicit impostor, ...
 */
export abstract class GeneralRenderer {
    onResize() {
        console.log("resizing");
    }

    render(delta: number, scene: ChromatinScene, camera: THREE.PerspectiveCamera) {
        console.log("render: to be implemented");
        camera.matrix;
        scene.models;
        console.log(delta);
    }
}

export class ChromatinRenderer {

    renderer: THREE.WebGLRenderer;
    // wgpuRenderer: WebGPURenderer;

    constructor(canvas: Element) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
        // WebGPU.isAvailable();
    }

    onResize(width: number, height: number) {
        //~ TODO: resize framebuffers etc.
    }

    render(delta: number, scene: ChromatinScene, camera: THREE.PerspectiveCamera) {
        scene.update(delta);

        console.log("i'm rendering...");
        this.renderer.render(scene.scene, camera);
    }
}
