'use client';

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function SearchMembers({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(term: string) {
    // Convert ReadonlyURLSearchParams to URLSearchParams
    const params = new URLSearchParams(searchParams.toString());

    if (term) {
      params.set('query', term);
      console.log(params.toString()); 
    } else {
      params.delete('query');
      console.log(params.toString()); 
    }

    // Construct the full URL string only if there are params
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    console.log("URL to navigate to:", newUrl); // Log the URL string

    // Use replace to update the URL without reloading
    router.replace(newUrl);
    
  }

  return (
    <Input
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="ring-zinc-300 bg-white dark:bg-inherit focus:dark:ring-zinc-700 focus:ring-zinc-300"
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSearch(searchTerm); // Pass searchTerm to handleSearch
      }}
      spellCheck="false" // Explicitly set spellCheck
      data-ms-editor="true" // Explicitly set data-ms-editor
    />
  );
}