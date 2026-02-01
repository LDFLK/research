import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenGIN Explorer",
  description: "Explore OpenGIN entities with an interactive API explorer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 antialiased">
        {children}
      </body>
    </html>
  );
}
