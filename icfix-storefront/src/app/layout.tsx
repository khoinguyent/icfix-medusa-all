import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "icFix Shop",
    template: "%s | icFix Shop",
  },
  description: "icFix Shop — Buy phones, laptops, and accessories with fast delivery.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "icFix Shop",
    description: "icFix Shop — Buy phones, laptops, and accessories with fast delivery.",
    url: getBaseURL(),
    siteName: "icFix Shop",
    images: [
      {
        url: "/opengraph-image.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "icFix Shop",
    description: "icFix Shop — Buy phones, laptops, and accessories with fast delivery.",
    images: ["/twitter-image.jpg"],
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
