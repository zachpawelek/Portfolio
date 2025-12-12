import localFont from "next/font/local";

export const cinzel = localFont({
  src: [
    { path: "../public/fonts/Cinzel-regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Cinzel-medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Cinzel-semibold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Cinzel-bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Cinzel-extrabold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/Cinzel-black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-cinzel",
  display: "swap",
});

export const cormorantSC = localFont({
  src: [
    { path: "../public/fonts/CormorantSC-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/CormorantSC-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/CormorantSC-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/CormorantSC-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/CormorantSC-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-cormorant-sc",
  display: "swap",
});


export const manrope = localFont({
    src: [
      { path: "../public/fonts/Manrope-ExtraLight.ttf", weight: "200", style: "normal" },
      { path: "../public/fonts/Manrope-Regular.ttf", weight: "400", style: "normal" },
      { path: "../public/fonts/Manrope-Medium.ttf", weight: "500", style: "normal" },
      { path: "../public/fonts/Manrope-SemiBold.ttf", weight: "600", style: "normal" },
      { path: "../public/fonts/Manrope-Bold.ttf", weight: "700", style: "normal" },
      { path: "../public/fonts/Manrope-ExtraBold.ttf", weight: "800", style: "normal" },
    ],
    variable: "--font-manrope",
    display: "swap",
  });


export const inter = localFont({
    src: [
      { path: "../public/fonts/Inter-Thin.ttf", weight: "100", style: "normal" },
      { path: "../public/fonts/Inter-Light.ttf", weight: "300", style: "normal" },
      { path: "../public/fonts/Inter-Medium.ttf", weight: "500", style: "normal" },
    ],
    variable: "--font-inter",
    display: "swap",
  });




