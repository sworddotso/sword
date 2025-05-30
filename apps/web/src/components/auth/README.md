# Authentication Components

This directory contains a modular, themeable authentication system built with React and TypeScript. The components are designed to be reusable, customizable, and maintainable.

## Overview

The authentication system is broken down into several key components:

- **Theme System**: Centralized theming with customizable variants
- **Container Components**: Layout and structure
- **Form Components**: Input fields and form elements
- **UI Components**: Headers, dividers, buttons, and links
- **Social Login**: Reusable social authentication buttons

## Component Structure

```
auth/
├── index.ts                    # Export all components
├── auth-theme-provider.tsx     # Theme context and provider
├── auth-container.tsx          # Main container layout
├── auth-header.tsx            # Form headers
├── auth-divider.tsx           # Section dividers
├── auth-form-field.tsx        # Form input fields
├── auth-switch-link.tsx       # Toggle between forms
├── social-login-button.tsx    # Social authentication buttons
├── google-icon.tsx            # Google icon component
├── theme-customizer.tsx       # Theme customization demo
└── README.md                  # This documentation
```

## Theme System

### Theme Structure

The theme system is defined in `src/lib/theme.ts` and includes:

```typescript
interface AuthTheme {
  container: { background: string; padding: string; };
  card: { background: string; border: string; borderRadius: string; shadow: string; padding: string; maxWidth: string; };
  typography: {
    heading: { size: string; weight: string; color: string; };
    body: { size: string; color: string; };
    link: { color: string; hoverColor: string; };
  };
  button: {
    primary: { background: string; hoverBackground: string; color: string; height: string; };
    secondary: { background: string; hoverBackground: string; color: string; border: string; };
  };
  input: { background: string; border: string; focusBorder: string; color: string; placeholderColor: string; height: string; };
  divider: { color: string; };
  error: { color: string; };
}
```

### Theme Variants

Three predefined variants are available:

1. **Default**: Standard zinc-based color scheme
2. **Minimal**: Transparent background, no borders
3. **Colorful**: Blue gradient backgrounds

### Using the Theme System

```tsx
import { AuthThemeProvider, useAuthTheme } from '@/components/auth';

// Wrap your components
<AuthThemeProvider initialVariant="default">
  <YourAuthComponents />
</AuthThemeProvider>

// Use the theme in components
const { theme, setVariant, customizeTheme } = useAuthTheme();
```

### Customizing Themes

```tsx
// Change theme variant
setVariant('minimal');

// Apply custom styling
customizeTheme({
  typography: {
    heading: {
      size: "text-3xl",
      color: "text-blue-600 dark:text-blue-400",
    },
  },
  button: {
    primary: {
      background: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
  },
});
```

## Component Usage

### Basic Setup

```tsx
import {
  AuthThemeProvider,
  AuthContainer,
  AuthHeader,
  AuthDivider,
  AuthFormField,
  AuthSwitchLink,
  SocialLoginButton,
  GoogleIcon,
} from '@/components/auth';

function LoginPage() {
  return (
    <AuthThemeProvider>
      <AuthContainer>
        <AuthHeader 
          title="Welcome back" 
          subtitle="Sign in to your account" 
        />
        
        <SocialLoginButton
          provider="Google"
          icon={<GoogleIcon />}
          onClick={handleGoogleLogin}
        />
        
        <AuthDivider />
        
        {/* Form fields */}
        
        <AuthSwitchLink
          text="Don't have an account?"
          linkText="Sign up"
          onClick={switchToSignUp}
        />
      </AuthContainer>
    </AuthThemeProvider>
  );
}
```

### Form Integration

The `AuthFormField` component integrates with TanStack Form:

```tsx
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
```

### Social Login Buttons

```tsx
<SocialLoginButton
  provider="Google"
  icon={<GoogleIcon className="w-5 h-5 mr-3" />}
  onClick={handleGoogleSignIn}
  disabled={isLoading}
/>
```

## Customization Examples

### Creating a Custom Theme Variant

```typescript
// In your theme configuration
export const myCustomTheme: AuthTheme = {
  ...defaultAuthTheme,
  card: {
    ...defaultAuthTheme.card,
    background: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
    borderRadius: "rounded-3xl",
  },
  button: {
    ...defaultAuthTheme.button,
    primary: {
      background: "bg-gradient-to-r from-purple-600 to-pink-600",
      hoverBackground: "hover:from-purple-700 hover:to-pink-700",
      color: "text-white",
      height: "h-12",
    },
  },
};
```

### Runtime Customization

```tsx
function ThemeControls() {
  const { customizeTheme } = useAuthTheme();
  
  const applyDarkMode = () => {
    customizeTheme({
      card: {
        background: "bg-zinc-900",
        border: "border border-zinc-700",
      },
      typography: {
        heading: { color: "text-white" },
        body: { color: "text-zinc-300" },
      },
    });
  };
  
  return <button onClick={applyDarkMode}>Apply Dark Theme</button>;
}
```

## Best Practices

1. **Component Composition**: Use the provided components as building blocks
2. **Theme Consistency**: Stick to the theme system for consistent styling
3. **Accessibility**: All components include proper ARIA attributes and keyboard navigation
4. **Responsive Design**: Components are mobile-first and responsive
5. **Type Safety**: Leverage TypeScript for better development experience

## Adding New Components

When creating new authentication components:

1. Follow the existing naming convention (`Auth*`)
2. Use the `useAuthTheme` hook for styling
3. Accept a `className` prop for additional customization
4. Export from `index.ts`
5. Update this README with usage examples

## Migration Guide

If you're migrating from the old authentication components:

1. Wrap your authentication pages with `AuthThemeProvider`
2. Replace the container divs with `AuthContainer`
3. Break down form sections using the individual components
4. Update styling to use the theme system instead of hardcoded classes

## Theme Development

To develop new themes or modify existing ones:

1. Update the theme interface in `src/lib/theme.ts`
2. Add new variants to `authThemeVariants`
3. Test with the `ThemeCustomizer` component
4. Document any breaking changes

This modular approach makes the authentication system highly customizable while maintaining consistency and type safety. 