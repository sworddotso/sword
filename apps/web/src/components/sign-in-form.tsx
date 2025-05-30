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

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
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
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
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
				title="Welcome back"
				subtitle="Sign in to your account to continue"
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
							placeholder="Enter your password"
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
							{state.isSubmitting ? "Signing in..." : "Sign in"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<AuthSwitchLink
				text="Don't have an account?"
				linkText="Sign up"
				onClick={onSwitchToSignUp}
			/>
		</div>
	);
}
