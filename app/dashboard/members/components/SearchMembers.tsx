"use client";

import { Input } from "@/components/ui/input";
import React, { startTransition, useState } from "react";
import { searchMembers } from "../actions";
import { toast } from '@/components/ui/use-toast';

export default function SearchMembers() {
	const [query, setQuery] = useState("");
  
	const handleSearch = () => {
	  startTransition(async () => {
		try {
		  const result = await searchMembers(query);
  
		  // 成功時のトースト表示
		  toast({
			title: "検索成功",
			description: (
			  <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
				<code className="text-white">検索クエリ: &quot;{query}&quot;  で結果が見つかりました</code>
			  </pre>
			),
		  });
		  console.log(query);
		} catch (error: any) {
		  // エラー時のトースト表示
		  toast({
			title: "検索エラー",
			description: (
			  <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
				<code className="text-white">エラー: {error.message}</code>
			  </pre>
			),
		  });
		}
	  });
	};
  
	return (
	  <Input
		placeholder="search by role, name"
		className="ring-zinc-300 bg-white dark:bg-inherit focus:dark:ring-zinc-700 focus:ring-zinc-300"
		value={query}
		onChange={(e) => setQuery(e.target.value)}
		onKeyDown={(e) => {
		  if (e.key === "Enter") handleSearch();
		}}
	  />
	);
  }
