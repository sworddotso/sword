import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod/v4";
import { AuthDivider } from "./auth/auth-divider";
import { AuthFormField } from "./auth/auth-form-field";
import { AuthHeader } from "./auth/auth-header";
import { AuthSwitchLink } from "./auth/auth-switch-link";
import { useAuthTheme } from "./auth/auth-theme-provider";
import { GoogleIcon } from "./auth/google-icon";
import { SocialLoginButton } from "./auth/social-login-button";
import Loader from "./loader";
import { Button } from "./ui/button";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();
	const { theme } = useAuthTheme();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.string().email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	const handleGoogleSignIn = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: `${window.location.origin}/dashboard`,
			},
			{
				onError: (error) => {
					toast.error(error.error.message);
				},
			},
		);
	};

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="space-y-6">
			<AuthHeader
				title="Create your account"
				subtitle="Sign up to get started with your new account"
			/>

			<SocialLoginButton
				provider="Google"
				icon={<GoogleIcon className="mr-3 h-5 w-5" />}
				onClick={handleGoogleSignIn}
			/>

			<AuthDivider />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="name">
					{(field) => (
						<AuthFormField
							field={field}
							label="Full Name"
							placeholder="Enter your full name"
						/>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<AuthFormField
							field={field}
							label="Email"
							type="email"
							placeholder="Enter your email"
						/>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<AuthFormField
							field={field}
							label="Password"
							type="password"
							placeholder="Create a strong password"
						/>
					)}
				</form.Field>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className={cn(
								"w-full",
								theme.button.primary.height,
								theme.button.primary.background,
								theme.button.primary.hoverBackground,
								theme.button.primary.color,
							)}
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Creating account..." : "Create account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<AuthSwitchLink
				text="Already have an account?"
				linkText="Sign in"
				onClick={onSwitchToSignIn}
			/>
		</div>
	);
}
