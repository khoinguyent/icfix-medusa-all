"use client"

import { Heading } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[60vh] w-full border-b border-ui-border-base relative bg-neutral-100 overflow-hidden">
      <Image
        src="/hero_iphone_17_pro.jpg"
        alt="Hero background"
        fill
        className="object-cover object-center"
        quality={100}
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-16 lg:px-32 gap-4 sm:gap-6">
        <span>
          <p className="text-ui-fg-on-color text-xs sm:text-sm uppercase tracking-wider">iPhone 17 Pro</p>

          <Heading
            level="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight sm:leading-8 md:leading-9 lg:leading-10 text-ui-fg-on-color font-normal mt-4 sm:mt-6 md:mt-8 lg:mt-10 mb-3 sm:mb-4 md:mb-5"
          >
            Pro đỉnh cao
          </Heading>
        </span>
        <a
          href="/products/iphone-17-promax"
          target="_blank"
        >
          <Button variant="secondary" className="rounded-2xl text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
            Đặt hàng ngay
          </Button>
        </a>
      </div>
    </div>
  )
}

export default Hero
