import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import { SiteChrome } from "@/components/layout/SiteChrome";

// Une seule famille de police pour tout le site (titres et texte courant) :
// rendu plus uniforme, `.font-display` ne fait plus que varier la graisse.
const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PECI — Promouvoir l'Éducation en Côte d'Ivoire",
    template: "%s | PECI",
  },
  description:
    "PECI est une ONG qui œuvre pour la promotion d'une éducation accessible, inclusive et de qualité en Côte d'Ivoire.",
  keywords: [
    "PECI",
    "éducation Côte d'Ivoire",
    "ONG éducation",
    "promouvoir l'éducation",
    "Côte d'Ivoire",
  ],
  openGraph: {
    title: "PECI — Promouvoir l'Éducation en Côte d'Ivoire",
    description:
      "ONG engagée pour une éducation accessible, inclusive et de qualité en Côte d'Ivoire.",
    url: siteUrl,
    siteName: "PECI",
    locale: "fr_CI",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-peci-dark">
        <AuthProvider>
          <ToastProvider>
            <SiteChrome>{children}</SiteChrome>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
