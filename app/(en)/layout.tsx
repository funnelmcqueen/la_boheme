import type { Metadata } from "next";
import { fontClassName } from "@/components/shell/fonts";
import { Shell } from "@/components/shell/Shell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Vajana by La Bohème — Beach Restaurant in Vlorë, Albania",
  description:
    "Beach restaurant on the bay of Vlorë. Fresh fish chosen from the ice, a 39 label cellar, evenings and private celebrations. Open daily 8:00–24:00.",
};

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassName} suppressHydrationWarning>
      <Shell>{children}</Shell>
    </html>
  );
}
