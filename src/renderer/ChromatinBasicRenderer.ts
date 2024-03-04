import { WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ChromatinScene } from '../chromatin';

export class ChromatinBasicRenderer {
    chromatinScene: ChromatinScene | undefined;

    //~ threejs stuff
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;

    constructor(canvas: HTMLCanvasElement | undefined = undefined) {
        this.renderer = new WebGLRenderer({ antialias: true, canvas });
        this.renderer.setClearColor("#eeeeee");
        this.renderer.setSize(800, 600);
        this.scene = new Scene();
        // camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera = new PerspectiveCamera( 75, 800 / 600, 0.1, 1000 );
        const controls = new OrbitControls(this.camera, this.renderer.domElement );

        this.camera.position.z = 5;
        controls.update();

        this.render = this.render.bind(this);
        this.getCanvasElement = this.getCanvasElement.bind(this);
    }

    getCanvasElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    addScene(scene: ChromatinScene) {
        this.chromatinScene = scene;

        const geometry = new BoxGeometry( 0.1, 0.1, 0.1 );
        const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new Mesh( geometry, material );

        for (let chunk of scene.chunks) {
            for (let b of chunk.bins) {
                // cube.position.set(b.x, b.y, b.z);
                const binCube = cube.clone();
                binCube.position.set(b[0], b[1], b[2]);
                this.scene.add(binCube);
            }
        }

        //~ TODO: scene.models
    }

    startDrawing() {
        requestAnimationFrame(this.render);
    }

    render() {
        requestAnimationFrame(this.render);

        console.log("drawing");

	this.renderer.render(this.scene, this.camera);
    }
};
