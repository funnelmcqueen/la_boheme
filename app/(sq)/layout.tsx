import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Vajana by La Bohème — Restorant Plazhi në Vlorë",
  description:
    "Restorant plazhi në gjirin e Vlorës. Peshk i freskët, qilar me 39 etiketa, mbrëmje dhe festa. Hapur çdo ditë 8:00–24:00.",
};

export default function AlbanianRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <Shell>{children}</Shell>
    </html>
  );
}
