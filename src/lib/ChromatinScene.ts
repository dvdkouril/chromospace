import * as THREE from 'three'
import type { ChromatinModel } from './ChromatinModel';
/**
 * ChromatinScene holds data for one or more ChromatinModels.
 * The scene is what gets sent to renderer for rendering.
 */

export class ChromatinScene {

    models: ChromatinModel[] = [];

    scene: THREE.Scene;
    testCubes: THREE.Mesh[] = [];

    //~ TODO: access to scene data for the renderer

    constructor() {
        this.models = [];

        this.scene = new THREE.Scene();

        {
            const color = 0xffffff;
            const intensity = 3;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            this.scene.add(light);
        }


        //~ add some test content to the scene
        this.makeTestScene();


    }

    makeTestScene() {
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new THREE.MeshPhongMaterial({ color: "#ff00aa" });
        // const customShaderMaterial = new THREE.ShaderMaterial();

        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.testCubes.push(cube);

    }

    makeCustomBufferGeometry() {
        const geometry = new THREE.BufferGeometry();

        const vertices = new Float32Array([
            -1.0, -1.0, 1.0, // v0
            1.0, -1.0, 1.0, // v1
            1.0, 1.0, 1.0, // v2
            -1.0, 1.0, 1.0, // v3
        ]);

        const indices = [
            0, 1, 2,
            2, 3, 0,
        ];

        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
    }

    update(delta: number) {
        const time = delta * 0.001; // convert time to seconds

        this.testCubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * 0.1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });
    }

    allModels(): ChromatinModel[] {
        return this.models;
    }

}