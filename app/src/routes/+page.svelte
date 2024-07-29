<script lang="ts">
	import ChromospaceApp from "$lib/ChromospaceApp.svelte";

	let chsApp: ChromospaceApp;

	function onScreenshotButtonClick() {
		chsApp.saveScreenshot();
	}
</script>

<p class="w-1/2">
	Yayyy, what's up, welcome to chromospace! This page will only get better and
	better. The idea is to have this as a sort of landing page but also a life
	version of the chromospace app where you should be able to load up your
	models, specify the view configs, and make screenshots and stuff.
</p>
<button class="btn" on:click={onScreenshotButtonClick}>Save Screenshot</button>

<ChromospaceApp bind:this={chsApp} />
