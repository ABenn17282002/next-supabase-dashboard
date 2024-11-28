import React from "react";
import TodoTable from "./components/TodoTable";
import SearchTodo from "./components/SearchTodo";
import CreateTodo from "./components/CreateTodo";
import { useUserStore } from "@/lib/store/user";

export default async function Todo({
	searchParams,
  }: {
	searchParams?: {
		todoQuery?: string;
		completed?: string;
	};
  }) {
	
	// user state
	const user = useUserStore.getState().user
	// is_admin Flag
	const isAdmin = user?.user_metadata.role === "admin";

    const todoQuery = searchParams?.todoQuery || ""; // default value ="" 
	const completed = searchParams?.completed === "all" || !searchParams?.completed
  	? "" // default value ="" 
	: searchParams.completed;

	return (
		<div className="space-y-5 w-full overflow-y-auto px-3">
			<h1 className="text-3xl font-bold">Todo</h1>
			<div className="flex items-center gap-2">
				{/* Show search button only if admin */}
				{isAdmin && <SearchTodo placeholder="search by title,author" />}
				<div className="ml-auto">
					<CreateTodo />
				</div>
			</div>
			<TodoTable todoQuery={todoQuery} completed={completed} />
		</div>
	);
}
