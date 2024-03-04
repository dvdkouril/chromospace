import { WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Mesh, SphereGeometry, CylinderGeometry, Vector3, Euler, Quaternion, DirectionalLight, AmbientLight, MeshStandardMaterial } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ChromatinChunk, ChromatinScene } from '../chromatin';
import { vec3 } from 'gl-matrix';
import { estimateBestSphereSize } from '../utils';

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

        this.camera.position.z = 1.5;
        controls.update();

        const lightA = new DirectionalLight();
        lightA.position.set(3, 10, 10);
        lightA.castShadow = true;
        // <T.DirectionalLight castShadow position={[3, 10, 10]} />
        const lightB = new DirectionalLight();
        lightB.position.set(-3, 10, -10);
        lightB.intensity = 0.2;
        // <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
        const lightC = new AmbientLight();
        lightC.intensity = 0.2;
        // <T.AmbientLight intensity={0.2} />
        this.scene.add(lightA, lightB, lightC);

        this.render = this.render.bind(this);
        this.getCanvasElement = this.getCanvasElement.bind(this);
    }

    getCanvasElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    addScene(scene: ChromatinScene) {
        this.chromatinScene = scene;

        for (let chunk of scene.chunks) {
            const meshes = this.buildPart(chunk);
            this.scene.add(...meshes);
        }

        //~ TODO: scene.models
    }

    buildPart(chunk: ChromatinChunk): Mesh[] {
        const sphereSize = estimateBestSphereSize(chunk.bins);
        const tubeSize = 0.8 * sphereSize;
        const sphereGeometry = new SphereGeometry(sphereSize);
        const tubeGeometry = new CylinderGeometry(tubeSize, tubeSize, 1.0, 3, 1);

        // const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        // const color = 0x00ff00;
        // const color = 0xeeeeee;
        const color = 0xffffff;
        const material = new MeshStandardMaterial( { color: color } );

        const binSphere = new Mesh(sphereGeometry, material);
        const binTube = new Mesh(tubeGeometry, material);

        let meshes: Mesh[] = [];
        //~ bin spheres
        for (let b of chunk.bins) {
            const s = binSphere.clone();
            s.position.set(b[0], b[1], b[2]);
            meshes.push(s);

        }
        //~ tubes between tubes
        for (let tube of this.computeTubes(chunk.bins)) {
            const t = binTube.clone();
            t.position.set(tube.position.x, tube.position.y, tube.position.z);
            t.rotation.set(tube.rotation.x, tube.rotation.y, tube.rotation.z, tube.rotation.order);
            t.scale.setY(tube.scale);
            meshes.push(t);
        }

        return meshes;
    }

    getRotationFromTwoPositions = (from: Vector3, to: Vector3) => {
        const fromCopy = new Vector3(from.x, from.y, from.z);
        const toCopy = new Vector3(to.x, to.y, to.z);
        const q = new Quaternion();
        const u = new Vector3(0, 1, 0);
        const v = toCopy.sub(fromCopy).normalize();

        q.setFromUnitVectors(u, v);

        const eulers = new Euler();
        return eulers.setFromQuaternion(q);
    }

    computeTubes = (bins: vec3[]) => {
        const t: {position: Vector3, rotation: Euler, scale: number}[] = [];
        for (let i = 0; i < bins.length - 1; i++) {
            const first = new Vector3(bins[i][0], bins[i][1], bins[i][2]);
            const second = new Vector3(
                bins[i + 1][0],
                bins[i + 1][1],
                bins[i + 1][2]
            );

            //~ position between the two bins
            const pos = new Vector3();
            pos.subVectors(second, first);
            pos.divideScalar(2);
            pos.addVectors(first, pos);
            const tubePosition = pos;
            //~ rotation
            const tubeRotation = this.getRotationFromTwoPositions(first, second);
            //~ tube length
            const betweenVec = new Vector3();
            betweenVec.subVectors(second, first);
            const tubeScale = betweenVec.length();

            t.push({
                position: tubePosition,
                rotation: tubeRotation,
                scale: tubeScale,
            });
        }

        return t;
    };

    startDrawing() {
        requestAnimationFrame(this.render);
    }

    render() {
        requestAnimationFrame(this.render);

        console.log("drawing");

	this.renderer.render(this.scene, this.camera);
    }
};
