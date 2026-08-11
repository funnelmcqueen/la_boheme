import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VenuePage } from "@/components/sections/Page";
import { sq } from "@/content/copy/sq";
import { VENUES, venueBySlug } from "@/content/venues";
import { JsonLd, SITE, restaurant } from "@/lib/schema";

export function generateStaticParams() {
  return VENUES.map((venue) => ({ venue: venue.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ venue: string }> }): Promise<Metadata> {
  const { venue: slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) return {};

  return {
    title: sq.meta.title,
    description: sq.meta.description,
    alternates: {
      canonical: `${SITE}/${venue.slug}`,
      languages: {
        sq: `${SITE}/${venue.slug}`,
        en: `${SITE}/en/${venue.slug}`,
        "x-default": `${SITE}/${venue.slug}`,
      },
    },
    openGraph: {
      title: sq.meta.title,
      description: sq.meta.description,
      url: `${SITE}/${venue.slug}`,
      type: "website",
      locale: "sq",
    },
  };
}

export default async function Page({ params }: { params: Promise<{ venue: string }> }) {
  const { venue: slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) notFound();

  return (
    <>
      <JsonLd data={restaurant(venue, sq)} />
      <VenuePage copy={sq} venue={venue} venues={VENUES} />
    </>
  );
}
