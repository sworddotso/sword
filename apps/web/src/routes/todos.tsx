import { createFileRoute } from "@tanstack/react-router";
import { TodoApp } from "@/components/TodoApp";

export const Route = createFileRoute("/todos")({
	component: TodosComponent,
});

function TodosComponent() {
	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				<TodoApp />
			</div>
		</div>
	);
} 