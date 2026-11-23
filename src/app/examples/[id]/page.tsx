import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamplePage } from "@/components/landing/example-page";
import { exampleCoaches, getExample } from "@/lib/example-coaches";

export const dynamicParams = false;
export const metadata: Metadata = {
  title: "Example page",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return exampleCoaches.map((e) => ({ id: e.id }));
}

/** A sample coach page, embedded by the landing page's examples. */
export default async function Example({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getExample(id)) notFound();
  return <ExamplePage id={id} />;
}
