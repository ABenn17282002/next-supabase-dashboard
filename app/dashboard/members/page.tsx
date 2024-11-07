import React from "react";
import MemberTable from "./components/MemberTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchMembers from "./components/SearchMembers";
import CreateMember from "./components/create/CreateMember";
import { useUserStore } from "@/lib/store/user";

export default function Members({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {

	const user = useUserStore.getState().user
	const isAdmin = user?.user_metadata.role === "admin";
  	const query = searchParams?.query || '';


	return (
		<div className="space-y-5 w-full overflow-y-auto px-3">
		  <h1 className="text-3xl font-bold">Members</h1>
		  	{isAdmin && (
			  <div className="flex gap-2">
				<SearchMembers placeholder="search by role, name" />
			  	<CreateMember />
			</div>
			)}
		  
		  <MemberTable query={query} />
		</div>
	  );
}