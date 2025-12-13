import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen isolate overflow-hidden">
        <div className="absolute inset-0 z-0">
        <Image
          src="/images/birds.jpg" 
          alt="Bird background"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        </div>

        {/* Optional: content on top of the background */}
        <div className="relative z-10 p-6 text-white">
          About
        </div>
    </main>
  );
}