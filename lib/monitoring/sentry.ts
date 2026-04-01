/**
 * Sentry error tracking configuration.
 *
 * Setup:
 * 1. npm install @sentry/nextjs
 * 2. npx @sentry/wizard@latest -i nextjs
 * 3. Set SENTRY_DSN in .env.local
 *
 * Until Sentry is installed, this module provides a no-op fallback
 * so error tracking calls don't break the build.
 */

const SENTRY_DSN = process.env.SENTRY_DSN ?? "";

interface ErrorContext {
  user?: { id: string; email?: string };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export function captureException(error: unknown, context?: ErrorContext): void {
  if (SENTRY_DSN) {
    // When @sentry/nextjs is installed, replace with:
    // Sentry.captureException(error, { user: context?.user, tags: context?.tags, extra: context?.extra });
    console.error("[Sentry]", error, context);
  } else {
    console.error("[Error]", error);
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  if (SENTRY_DSN) {
    console.log(`[Sentry:${level}]`, message);
  }
}

export function setUser(user: { id: string; email?: string; role?: string }): void {
  if (SENTRY_DSN) {
    // Sentry.setUser(user);
  }
}
