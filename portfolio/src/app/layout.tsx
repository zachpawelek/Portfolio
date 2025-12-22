import "./globals.css";
import Header from "@/components/navigation/Header";
import ScrollPerfClass from "@/components/ScrollPerfClass";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        {/* Adds/removes `is-scrolling` on <html> to disable expensive backdrop blur during scroll */}
        <ScrollPerfClass />

        <Header />
        {children}
      </body>
    </html>
  );
}
