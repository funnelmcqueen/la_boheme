import { notFound } from "next/navigation";
import { VenueChrome } from "@/components/shell/VenueChrome";
import { sq } from "@/content/copy/sq";
import { venueBySlug } from "@/content/venues";

export default async function VenueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ venue: string }>;
}) {
  const { venue: slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) notFound();

  return (
    <VenueChrome copy={sq} venue={venue}>
      {children}
    </VenueChrome>
  );
}
