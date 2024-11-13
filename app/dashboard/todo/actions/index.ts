"use server";

import { createSupbaseServerClient } from "@/lib/supabase";

export async function createTodo(title: string) {
	
	// Create the Supabase client on the server side
	const supabase = await createSupbaseServerClient();

  	// Get user information
	const { data: { user }, error } = await supabase.auth.getUser();
	if (error || !user) {
		return JSON.stringify({ error: "User not authenticated" });
	}

  	// Set the current user ID in the `created_by` field and insert
	const result = await supabase
    .from("todo")
    .insert({
		title,
      	created_by: user.id  // set `created_by` to the user's ID
    })
    .single();

	return JSON.stringify(result);
}


export async function readTodos() {}

export async function updateTodoById(id: string) {
	console.log("update todo");
}

export async function deleteTodoById(id: string) {}