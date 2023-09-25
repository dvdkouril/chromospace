import type { PerspectiveCamera } from 'three';
import { ChromatinRenderer } from "./ChromatinRenderer";

/**
 * The purpose of Viewport3D class is to produce one specific canvas with rendered 3D data.
 * 
 * Other functionalities/responsibilities:
 * - handle window/panel resizing
 * - handle mouse and keyboard events
 */

class Viewport3D {
    id: number;

    //~ canvas for output
    canvas?: Element;

    //~ scene / content / data
    scene: ChromatinScene = new ChromatinScene();

    //~ camera
    primaryCamera: PerspectiveCamera;

    //~ renderer
    renderer: ChromatinRenderer = new ChromatinRenderer();

    constructor() {
        this.id = 0;
    }

    render(delta: number) {
        this.renderer.render(delta, this.scene, this.primaryCamera);
    }

}