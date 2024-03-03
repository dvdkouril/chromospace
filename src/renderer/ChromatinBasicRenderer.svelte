<script lang="ts">
	import type { ChromatinChunk } from "$lib/chromatin";
	import { onMount } from "svelte";
	import { PerspectiveCamera, Scene, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from "three";

	//~ DOM
	export let canvas: HTMLElement;

	//~ chromatin data
	export let parts: ChromatinChunk[];
	$: partsChanged(parts);

	//~ threejs stuff
	let renderer: WebGLRenderer;
	let scene: Scene;
	let camera: PerspectiveCamera;

	const partsChanged = (parts: ChromatinChunk[]) => {
		console.log("partsChanged");
		if (!scene) {
			return;
		}
		scene.clear();

		console.log("adding cube!");
		const geometry = new BoxGeometry( 1, 1, 1 );
		const material = new MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = new Mesh( geometry, material );
		scene.add( cube );

		for (const p of parts) {
			for (const bin of p.bins) {
				// scene.add();
			}
		}
	};

	onMount(() => {
		renderer = new WebGLRenderer({ antialias: true, canvas });
		renderer.setClearColor("#eeeeee");
		scene = new Scene();
		// camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera = new PerspectiveCamera( 75, 800 / 600, 0.1, 1000 );

		camera.position.z = 5;

		requestAnimationFrame(render);
	});

	const onResize = (width: number, height: number) => {
	};

	const render = () => {
		requestAnimationFrame(render);

		// console.log("rendering");
		renderer.render(scene, camera);
	};

</script>
