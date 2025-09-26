"use client"

import { MagnifyingGlassMini } from "@medusajs/icons"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

const SearchInResults = ({ listName }: { listName?: string }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const placeholder = listName ? `Search in ${listName}` : "Search in products"

  useEffect(() => {
    const currentQuery = searchParams.get("q") || ""
    setQuery(currentQuery)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const params = new URLSearchParams(searchParams)
      params.set("q", query.trim())
      router.push(`/store?${params.toString()}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <form onSubmit={handleSearch} className="group relative text-sm focus-within:border-neutral-500 rounded-t-lg focus-within:outline focus-within:outline-neutral-500">
      <input
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        className="w-full p-2 pr-8 focus:outline-none rounded-lg"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <MagnifyingGlassMini className="w-4 h-4 text-neutral-500" />
      </div>
    </form>
  )
}

export default SearchInResults