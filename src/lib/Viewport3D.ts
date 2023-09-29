import * as THREE from 'three';
import { ChromatinRenderer } from "./ChromatinRenderer";
import { ChromatinScene } from './ChromatinScene';

/**
 * The purpose of Viewport3D class is to produce one specific canvas with rendered 3D data.
 * 
 * Other functionalities/responsibilities:
 * - handle window/panel resizing
 * - handle mouse and keyboard events
 */

export class Viewport3D {
    id: number;

    //~ canvas for output
    canvas: Element;
    width: number;
    height: number

    //~ scene / content / data
    scene: ChromatinScene = new ChromatinScene();

    //~ camera
    primaryCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();

    //~ renderer
    renderer: ChromatinRenderer;

    constructor(canvas: Element) {
        this.id = 0;

        this.canvas = canvas;
        this.renderer = new ChromatinRenderer(canvas);

        this.width = 800;
        this.height = 800;

        this.init();
    }

    init = () => {
        // const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

        const fov = 75;
        const aspect = 2; // the canvas default
        const near = 0.1;
        const far = 5;
        this.primaryCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.primaryCamera.position.z = 2;

        //~ initiate the render loop
        requestAnimationFrame(this.render);
    }

    render = (delta: number) => {
        this.renderer.render(delta, this.scene, this.primaryCamera);

        // @TODO: move this to onResize
        if (resizeRendererToDisplaySize(this.renderer.renderer)) {
            // const canvas = renderer.domElement;
            this.primaryCamera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.primaryCamera.updateProjectionMatrix();
        }

        requestAnimationFrame(this.render);
    }

    onResize = (width: number, height: number) => {
        this.width = width;
        this.height = height;

        this.renderer.onResize(this.width, this.height);
    }

}

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}