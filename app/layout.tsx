import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlbertaFinder — AI-Powered Course Search for Alberta Colleges & Universities",
  description:
    "Search programs across all 26 Alberta post-secondary institutions with AI. Get real-time fees, semester details, and direct source links.",
  keywords: [
    "Alberta courses",
    "SAIT programs",
    "NAIT programs",
    "University of Calgary",
    "University of Alberta",
    "Alberta college search",
    "post-secondary Alberta",
    "tuition Alberta",
  ],
  openGraph: {
    title: "AlbertaFinder — AI-Powered Course Search",
    description:
      "Search programs across all 26 Alberta colleges and universities with AI-powered real-time results.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}