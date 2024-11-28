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

    // Get current user information
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { data: null }; // If user is not authenticated
    }

    // Check the `permission` table to determine if you are an administrator
    const { data: isAdminData } = await supabase
        .from("permission")
        .select("role")
        .eq("member_id", user.id)
        .eq("role", "admin")
        .single();

    const isAdmin = isAdminData !== null;

    // Branch queries based on flags
    const query = supabase
        .from("todo")
        .select("id, title, completed, created_at, created_by, member:created_by (id, created_at, name, email)");

    if (!isAdmin) {
        // Filter by `created_by` for general users
        query.eq("created_by", user.id);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching todos:", error.message);
        return { data: null };
    }

    return { data };

}

// UpdateTodo function
export async function updateTodoById(
	id: string ,
	data: {
		title:string,
		completed: boolean
	}
){
	const supabase = await createSupbaseServerClient();
	// update title,comleted
	const result = await supabase.from("todo").update(data).eq("id", id);
	revalidatePath("/dashboard/todo");
	return JSON.stringify(result);
}

// fecthTodo funciton
export async function fetchTodoById(id: string) {

    const supabase = await createSupbaseServerClient();
    const { data, error } = await supabase
        .from('todo') 
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching todo:", error.message);
        return { error: error.message };
    }

    return { data };
}

// Delete Todo function
export async function deleteTodoById(id: string): Promise<string> {

    const supabase = await createSupbaseServerClient();

    // Get current logged in user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // If you are not logged in
        return JSON.stringify({ error: { message: "ログインしてください。" } });
    }

    // Get task information
    const { data: todo, error: todoError } = await supabase
        .from("todo")
        .select("created_by, completed")
        .eq("id", id)
        .single();

    if (todoError || !todo) {
        // If task not found
        return JSON.stringify({ error: { message: "Target task not found." } });
    }

    // Check if you are an administrator
    const { data: isAdminData } = await supabase
        .from("permission")
        .select("role")
        .eq("member_id", user.id)
        .eq("role", "admin")
        .single();

    const isAdmin = isAdminData !== null;

    // Deletion conditions for administrators
    if (isAdmin) {
        // If a task other than your own is uncompleted, you cannot delete it.
        if (todo.created_by !== user.id && !todo.completed) {
            return JSON.stringify({
                error: { message: "The administrator cannot delete someone else's uncompleted tasks." },
            });
        }
    } 

    // Perform deletion if conditions are met
    const { data: deleteResult, error: deleteError } = await supabase
        .from("todo")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return JSON.stringify({ error: { message: "Failed to delete task." } });
    }

    // Revalidate cache
    revalidatePath("/dashboard/todo");

    return JSON.stringify({ success: true, data: deleteResult });
}

// SearchTasl funciton
export async function SearchTask(todoQuery: string | null = "", completed: string | null = "all") {

    console.log(`Search query: ${todoQuery}, Completed: ${completed}`);

    const supabase = await createSupbaseServerClient();

    let completedFilter: boolean | null = null;

    if (completed === "true") {
      completedFilter = true;
    } else if (completed === "false") {
      completedFilter = false;
    }
  
    const { data, error } = await supabase
      .rpc('search_todos', {
        query: todoQuery || null,
        completed_filter: completedFilter,
      });
  
    if (error) {
      console.error('Error searching todos:', error);
      return [];
    }
    console.log(data);
    return data;
}
