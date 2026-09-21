import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darkest Nyts Studio",
  description: "AI faceless content production studio"
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}