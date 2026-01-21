// ABOUTME: Informational section explaining what Human Passport is.
// ABOUTME: Provides context and link to passport.xyz for new users.

'use client';

export function PassportInfo() {
  return (
    <div className="rounded-lg bg-muted p-4 text-sm">
      <p className="font-medium">What is Human Passport?</p>
      <p className="mt-1 text-muted-foreground">
        Human Passport helps you prove your unique humanity by collecting stamps
        from various services you use. A score of 20+ is recommended to be
        considered a verified human.
      </p>
      <a
        href="https://passport.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-primary hover:underline"
      >
        Get your Passport →
      </a>
    </div>
  );
}
