import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VenuePage } from "@/components/sections/Page";
import { en } from "@/content/copy/en";
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
    title: en.meta.title,
    description: en.meta.description,
    alternates: {
      canonical: `${SITE}/en/${venue.slug}`,
      languages: {
        sq: `${SITE}/${venue.slug}`,
        en: `${SITE}/en/${venue.slug}`,
        "x-default": `${SITE}/${venue.slug}`,
      },
    },
    openGraph: {
      title: en.meta.title,
      description: en.meta.description,
      url: `${SITE}/en/${venue.slug}`,
      type: "website",
      locale: "en",
    },
  };
}

export default async function Page({ params }: { params: Promise<{ venue: string }> }) {
  const { venue: slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) notFound();

  return (
    <>
      <JsonLd data={restaurant(venue, en)} />
      <VenuePage copy={en} venue={venue} venues={VENUES} />
    </>
  );
}
