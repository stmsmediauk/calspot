import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/onboarding",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/auth",
        "/api",
        "/preview",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
