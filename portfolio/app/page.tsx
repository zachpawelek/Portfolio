import { cinzel, cormorantSC, manrope, inter } from "./fonts";

export default function Home() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <p className={cinzel.className}>Cinzel — The Quick Brown Fox 123</p>
      <p className={cormorantSC.className}>Cormorant SC — The Quick Brown Fox 123</p>
      <p className={manrope.className}>Manrope — The Quick Brown Fox 123</p>
      <p className={inter.className}>Inter — The Quick Brown Fox 123</p>
    </main>
  );
}
