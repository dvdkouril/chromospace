import { WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
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
        this.scene = new Scene();
        // camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera = new PerspectiveCamera( 75, 800 / 600, 0.1, 1000 );

        this.camera.position.z = 5;

        this.render = this.render.bind(this);
        this.getCanvasElement = this.getCanvasElement.bind(this);
    }

    getCanvasElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    addScene(scene: ChromatinScene) {
        this.chromatinScene = scene;

        const geometry = new BoxGeometry( 1, 1, 1 );
        const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new Mesh( geometry, material );

        for (let chunk of scene.chunks) {
            for (let b of chunk.bins) {
                // cube.position.set(b.x, b.y, b.z);
                cube.position.set(0, 0, 0);
                this.scene.add(cube);
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
