<script lang="ts">
	import ChromospaceApp from "$lib/ChromospaceApp.svelte";

	let chsApp: ChromospaceApp;

	function onScreenshotButtonClick() {
		chsApp.saveScreenshot();
	}
</script>

<p class="text-xl py-2">
	<b>chromospace</b> is a javascript library for visualization of three-dimensional
	chromatin models.
</p>
<p class="text-xl py-2">
	Our goal is to provide a simple-to-use tool for working with 3D data in the
	genomics context. We put emphasis on usage in various environments: besides
	making a single visualization app, we also package chromospace as a widget
	usable in python-based computational notebooks, such as Jupyter.
</p>

<ChromospaceApp bind:this={chsApp} />
<button on:click={onScreenshotButtonClick}>Save Screenshot</button>
