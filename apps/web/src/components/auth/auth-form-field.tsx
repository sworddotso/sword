import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthTheme } from "./auth-theme-provider";

interface AuthFormFieldProps {
	field: any; // Using any for now to match TanStack Form's complex types
	label: string;
	type?: string;
	placeholder?: string;
	className?: string;
}

export function AuthFormField({
	field,
	label,
	type = "text",
	placeholder,
	className,
}: AuthFormFieldProps) {
	const { theme } = useAuthTheme();

	return (
		<div className={cn("space-y-2", className)}>
			<Label
				htmlFor={field.name}
				className={cn(
					"font-medium",
					theme.typography.body.size,
					theme.typography.heading.color,
				)}
			>
				{label}
			</Label>
			<Input
				id={field.name}
				name={field.name}
				type={type}
				placeholder={placeholder}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				className={cn(
					theme.input.height,
					theme.input.background,
					theme.input.border,
					theme.input.focusBorder,
					theme.input.color,
					theme.input.placeholderColor,
				)}
			/>
			{field.state.meta.errors.map((error: any, index: number) => (
				<p
					key={error?.message || index}
					className={cn(theme.typography.body.size, theme.error.color)}
				>
					{error?.message}
				</p>
			))}
		</div>
	);
}
