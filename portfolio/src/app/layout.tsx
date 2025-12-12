import type { ReactNode } from "react"
import "./globals.css";
import { cinzel, cormorantSC, manrope, inter} from "@/lib/fonts";

export default function RootLayout({ children }: {children: ReactNode}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorantSC.variable} ${manrope.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
 