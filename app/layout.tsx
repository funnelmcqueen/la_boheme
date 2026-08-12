import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Funnel Copy Generator",
  description: "Generate landing-page copy for any trade in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
