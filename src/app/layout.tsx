import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loom Studio",
  description: "A visual page builder for your React component library.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
