"use client"

import { Heading } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-neutral-100">
      <Image
        src="/hero_iphone_17_pro.jpg"
        alt="Hero background"
        layout="fill"
        quality={100}
        priority
      />
      <div className="absolute inset-0 z-1 mt-30 flex flex-col items-center text-center small:p-32 gap-6">
        <span>
          <p className="text-ui-fg-on-color text-xs uppercase">iPhone 17 Pro</p>

          <Heading
            level="h1"
            className="text-6xl leading-10 text-ui-fg-on-color font-normal mt-10 mb-5"
          >
            Pro đỉnh cao
          </Heading>
        </span>
        <a
          href="https://github.com/medusajs/b2b-starter-medusa"
          target="_blank"
        >
          <Button variant="secondary" className="rounded-2xl">
            Đặt hàng ngay
          </Button>
        </a>
      </div>
    </div>
  )
}

export default Hero
