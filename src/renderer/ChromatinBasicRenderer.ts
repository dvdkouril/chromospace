import { WebGLRenderer, Scene, PerspectiveCamera } from 'three';

export class ChromatinBasicRenderer {
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

    startDrawing() {
        requestAnimationFrame(this.render);
    }

    render() {
        requestAnimationFrame(this.render);

        console.log("drawing");

	this.renderer.render(this.scene, this.camera);
    }
};
