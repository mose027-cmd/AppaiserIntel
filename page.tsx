import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AppraiserIntel",
  description: "Verified fee data and market intelligence for real estate appraisers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
