import { Metadata } from "next"
import LoginTemplate from "@modules/account/templates/login-template"

export async function generateStaticParams() {
  try {
    const { locales } = await import("@/i18n/config");
    const { listRegions } = await import("@lib/data/regions");
    const countryCodes = await listRegions().then(
      (regions) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    );
    // Return combinations of locale and countryCode
    return locales.flatMap((locale) =>
      countryCodes.map((countryCode) => ({ locale, countryCode }))
    );
  } catch (error) {
    console.warn("generateStaticParams for login page failed, returning default:", error);
    // Return default combinations if regions fetch fails
    return [
      { locale: "en", countryCode: "vn" },
      { locale: "vi", countryCode: "vn" },
    ];
  }
}

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Medusa Store account.",
}

export default function Login() {
  return <LoginTemplate />
}
