import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StyledComponentsRegistry from "../lib/registry";

const prompt = localFont({
  variable: "--font-prompt",
  src: [
    { path: "./fonts/Prompt-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Prompt-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Prompt-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Prompt-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Prompt-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "POS Center",
  description: "Advanced Service Center for POS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${prompt.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
