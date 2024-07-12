<script lang="ts">
	let count = $state(0);
</script>

<p>Count: {count}</p>
<button
	class="bg-red-500 rounded-xl text-white font-bold px-4 py-2 shadow-lg"
	onclick={() => count++}
>
	Increment
</button>
