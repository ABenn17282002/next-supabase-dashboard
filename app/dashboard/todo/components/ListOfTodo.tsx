import React from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import EditTodo from "./EditTodo";
import { cn } from "@/lib/utils";
import { readTodos } from "../actions";
import DeleteTodo from "./DeleteTodo";

export default async function ListOfTodo() {
	const { data: todos } = await readTodos();

	if (!todos || todos.length === 0) {
		return (
			<div className="dark:bg-inherit bg-white mx-2 rounded-sm p-4">
				<h2>No tasks found.</h2>
			</div>
		);
	}

	return (
		<div className="dark:bg-inherit bg-white mx-2 rounded-sm">
			{todos.map((todo, index) => (
				<div
					className="grid grid-cols-5 rounded-sm p-3 align-middle font-normal"
					key={todo.id || index}
				>
					<h1 className="flex items-center dark:text-white text-lg">{todo.title}</h1>
					<div className="flex items-center">
						<span
							className={cn(
								"dark:bg-zinc-800 px-2 py-1 rounded-full shadow capitalize border-[.5px] text-sm",
								{
									"border-green-500 bg-green-400 dark:text-green-400": todo.completed,
								}
							)}
						>
							{todo.completed ? "Completed" : "Not Completed"}
						</span>
					</div>
					<h1 className="flex items-center dark:text-white text-lg">{todo.created_at}</h1>
					<h1 className="flex items-center dark:text-white text-lg">
					{Array.isArray(todo.member) 
							? todo.member[0]?.name || "Unknown"
							: todo.member?.name || "Unknown"}
					</h1>
					<div className="flex gap-2 items-center">
						<DeleteTodo id={todo.id}/>
						<EditTodo todoId={todo.id} />
					</div>	
				</div>
			))}
		</div>
	);
}