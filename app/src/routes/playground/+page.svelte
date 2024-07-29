<script lang="ts">
	import ChromospaceApp from "$lib/ChromospaceApp.svelte";
</script>

<div id="wrapper">
	<div id="editor">TODO: editor</div>
	<div id="chromospace-view"><ChromospaceApp /></div>
</div>

<style>
	#wrapper {
		display: flex;
	}

	#editor {
		width: 50%;
		height: 100vh;
		background-color: red;
	}

	#chromospace-view {
		width: 50%;
		height: 100vh;
		background-color: blue;
	}
</style>
