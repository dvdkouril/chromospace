<script lang="ts">
	import ChromospaceApp from "$lib/ChromospaceApp.svelte";
</script>

<div class="text-xl">
	<p class="py-2">
		<b>chromospace</b> is a javascript library for visualization of three-dimensional
		chromatin models.
	</p>
	<p class="py-2">
		Our goal is to provide a simple-to-use tool for working with 3D data in
		the genomics context. We put emphasis on usage in various environments:
		besides making a single visualization app, we also package chromospace
		as a widget usable in python-based computational notebooks, such as
		Jupyter.
	</p>
	<p class="py-2">
		Github: <a
			class="text-blue-600 dark:text-blue-500 hover:underline"
			href="https://github.com/dvdkouril/chromospace"
			target="_blank">dvdkouril/chromospace</a
		>
	</p>
</div>

<ChromospaceApp />
