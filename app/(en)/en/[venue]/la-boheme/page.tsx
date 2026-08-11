import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryPage } from "@/components/sections/StoryPage";
import { en } from "@/content/copy/en";
import { VENUES, venueBySlug } from "@/content/venues";
import { SITE } from "@/lib/schema";

export function generateStaticParams() {
  return VENUES.map((venue) => ({ venue: venue.slug }));
}

export const dynamicParams = false;

export const metadata: Metadata = {
  title: en.meta.storyTitle,
  description: en.meta.storyDescription,
  alternates: {
    canonical: `${SITE}/en/vajana/la-boheme`,
    languages: {
      sq: `${SITE}/vajana/la-boheme`,
      en: `${SITE}/en/vajana/la-boheme`,
      "x-default": `${SITE}/vajana/la-boheme`,
    },
  },
};

export default async function Page({ params }: { params: Promise<{ venue: string }> }) {
  const { venue: slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) notFound();

  return <StoryPage copy={en} venue={venue} />;
}
