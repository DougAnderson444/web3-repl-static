<script>
	import { Alert, Button } from "sveltestrap";
	export let visible;
</script>

<Alert
	color="primary"
	isOpen={visible}
	toggle={() => {
		visible = false;
	}}
>
	<slot />
</Alert>
