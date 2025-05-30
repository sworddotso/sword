import { ArrowPathIcon } from "@heroicons/react/16/solid";

export default function Loader() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400" />
		</div>
	);
}
