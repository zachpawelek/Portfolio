import "./globals.css"
import Header from "@/components/navigation/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
