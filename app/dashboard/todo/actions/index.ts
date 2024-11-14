"use server";
import { createSupbaseServerClient } from "@/lib/supabase";
import { Todo } from "@/lib/types";
import { revalidatePath } from "next/cache";

// CreateTodo function
export async function createTodo(title: string, completed: boolean) {
	try {

		// Create the Supabase client on the server side
		const supabase = await createSupbaseServerClient();

		// Get user information
		const { data: { user }, error } = await supabase.auth.getUser();
		if (error || !user) {
			throw new Error("User not authenticated");
		}

		// Insert into database
		const result = await supabase
			.from("todo")
			.insert({
				title,
				completed,          // insert `completed` status
				created_by: user.id // set `created_by` to the user's ID
			})
			.single();
		// return todo
		revalidatePath("/dashboard/todo");
		return JSON.stringify(result);
	} catch (error) {
		// Check if error is of type Error
		let errorMessage = "An unexpected error occurred";
		if (error instanceof Error) {
			errorMessage = error.message;
		}

		console.error("Error creating todo:", errorMessage);
		return JSON.stringify({ error: errorMessage });
	}
}

// ReadTodo function
export async function readTodos(): Promise<{ data: Todo[] | null }> {

	const supabase = await createSupbaseServerClient();

	// ReadTodo function: Fetches todo item details along with creator information
	return await supabase
	.from("todo")
	.select("id, title, completed, created_at, created_by, member:created_by (id, created_at, name, email)");

}

export async function updateTodoById(id: string) {
	console.log("update todo");
}

export async function deleteTodoById(id: string) {}