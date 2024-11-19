"use client";
import React from "react";
import DailogForm from "./DialogForm";
import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import MemberForm from "./TodoForm";
import { fetchTodoById } from "../actions";

export default function EditTodo({ todoId }: { todoId: string }) {
    const [todoData, setTodoData] = React.useState(null);

    React.useEffect(() => {
        async function fetchTodo() {
            const { data, error } = await fetchTodoById(todoId); 
            if (!error) {
                setTodoData(data);
            }
        }
        fetchTodo();
    }, [todoId]);

    if (!todoData) {
        return <p>Loading...</p>;
    }

	return (
		<DailogForm
			id="update-trigger"
			title="Edit Todo"
			Trigger={
				<Button variant="outline">
					<Pencil1Icon />
					Edit
				</Button>
			}
			form={<MemberForm isEdit={true} todoData={todoData} todoId={todoId} />}
		/>
	);
}
