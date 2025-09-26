"use client"

import { MagnifyingGlassMini } from "@medusajs/icons"
import { useRouter } from "next/navigation"
import { useState } from "react"

const SearchInput = () => {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/store?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <form onSubmit={handleSearch} className="relative mr-2 hidden small:inline-flex">
      <input
        type="text"
        placeholder="Search for products"
        value={query}
        onChange={handleInputChange}
        className="bg-gray-100 text-zinc-900 px-4 py-2 rounded-full pr-10 shadow-borders-base hidden small:inline-block focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <MagnifyingGlassMini className="w-4 h-4 text-neutral-500" />
      </div>
    </form>
  )
}

export default SearchInput
