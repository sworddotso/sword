import { AuthContainer } from "@/components/auth/auth-container";
import { AuthThemeProvider } from "@/components/auth/auth-theme-provider";
import { ThemeCustomizer } from "@/components/auth/theme-customizer";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<AuthThemeProvider>
			<AuthContainer>
				{showSignIn ? (
					<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
				) : (
					<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
				)}
			</AuthContainer>
			<ThemeCustomizer />
		</AuthThemeProvider>
	);
}
