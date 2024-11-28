'use client';

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function SearchTodo({ placeholder }: { placeholder: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [completed, setCompleted] = useState("all"); 
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function handleSearch(term: string, status: string) {
    const params = new URLSearchParams(searchParams.toString());

    // Add or remove search term
    if (term) {
      params.set('todoQuery', term);
    } else {
      params.delete('todoQuery');
    }

    // Add or remove completed status
    if (status === 'true' || status === 'false') {
      params.set('completed', status);
    } else {
      params.delete('completed'); 
    }

    // Update URL
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  }

  return (
    <div className="flex items-center justify-between">
      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <Input
          placeholder={placeholder}
          className="border-zinc-600 focus:border-zinc-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(searchTerm, completed);
          }}
        />
        <select
          value={completed}
          onChange={(e) => setCompleted(e.target.value)}
          className="border border-zinc-600 focus:outline-none p-2 rounded"
        >
          <option value="all">All</option>
          <option value="true">Completed</option>
          <option value="false">Not Completed</option>
        </select>
        <button
          onClick={() => handleSearch(searchTerm, completed)} // Trigger search on click
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none ml-4"
        >
          Search
        </button>
      </div>
    </div>
  );
}
