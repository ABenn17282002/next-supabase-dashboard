import React from "react";
import ListOfTodo from "./ListOfTodo";
import Table from "@/components/ui/Table";
interface ListOfTodosProps {
	todoQuery: string;
	completed:string;
}

export default function TodoTable({ todoQuery = "", completed = "" }: ListOfTodosProps) {

	const tableHeader = ["Title", "Status", "Created at", "Created by"];

	return (
		<Table headers={tableHeader}>
			<ListOfTodo todoQuery={todoQuery} completed={completed} />
		</Table>
	);
}
