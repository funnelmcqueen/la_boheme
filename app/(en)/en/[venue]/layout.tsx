import { notFound } from "next/navigation";
import { VenueChrome } from "@/components/shell/VenueChrome";
import { en } from "@/content/copy/en";
import { venueBySlug } from "@/content/venues";

export default async function VenueLayoutEn({
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
    <VenueChrome copy={en} venue={venue}>
      {children}
    </VenueChrome>
  );
}
