"use server";
import { readUserSession } from "@/lib/actions";
import { createSupabaseAdmin, createSupbaseServerClient } from "@/lib/supabase";
import { revalidatePath, unstable_noStore } from "next/cache";
import { json } from "stream/consumers";

export async function createMember(data: {
	email: string;
	password: string;
	name: string;
	role: "user" | "admin";
	status: "active" | "resigned";
	confirm: string;
}) {

	const { data: userSession } = await readUserSession();

	if (userSession.session?.user.user_metadata.role !== "admin") {
		return JSON.stringify({ error: { message: "You are not allowed to do this!" } });
	}
	
	const supabase = await createSupabaseAdmin();

	// create account
	const createResult = await supabase.auth.admin.createUser({
		email: data.email,
		password: data.password,
		email_confirm: true,
		user_metadata: {
			role: data.role
		}
	});

	if (createResult.error?.message) {
		return JSON.stringify(createResult);
	} else {
		// create member
		const memberResult = await supabase
		.from("member")
		.insert({ 
				name: data.name, 
				id: createResult.data.user?.id, 
				email: data.email
			});

		if (memberResult.error?.message) {
			return JSON.stringify(memberResult);
		} else {
			
			// create permission
			const permissionResult = await supabase
			.from("permission")
			.insert({ role: data.role, 
							member_id: createResult.data.user?.id, 
							status:data.status
					});
			revalidatePath("/dashboard/member");
			return JSON.stringify(permissionResult)
		}
	}
	
}

export async function updateMemberBasicById(
	id: string ,
	data: {
		name:string,
	}
) {
	// call to Session
	const supabase = await createSupbaseServerClient();
	// update user name
	const result = await supabase.from("member").update(data).eq("id", id);
	revalidatePath("/dashboard/member");
	return JSON.stringify(result);
}

export async function updateMemberAdvanceById(
	permission_id: string ,
	user_id:string,
	data: {
		role: "user" | "admin";
		status: "active" | "resigned";
	}
) {

	const { data: userSession } = await readUserSession();

	if (userSession.session?.user.user_metadata.role !== "admin") {
		return JSON.stringify({ error: { message: "You are not allowed to do this!" } });
	}
	
	const supabaseAdmin = await createSupabaseAdmin();

	// update admin data
	const updateResult = await supabaseAdmin.auth.admin.updateUserById(
		user_id,
		{ user_metadata: { role: data.role } }
	)

	if (updateResult.error?.message) {

		return JSON.stringify(updateResult);
		
	} else {

	// update permission data
	const supabase = await createSupbaseServerClient();
	const result = await supabase.from("permission").update(data).eq("id", permission_id);
	revalidatePath("/dashboard/member");
	return JSON.stringify(result);
	  }

}


export async function deleteMemberById(user_id: string) {
	// call to Session
	const { data: userSession } = await readUserSession();
  
	// admin only
	if (userSession.session?.user.user_metadata.role !== "admin") {
	  return JSON.stringify({ error: { message: "You are not allowed to do this!" } });
	}
  
	const supabase = await createSupbaseServerClient();
  
	// Query to check how many active admins exist
	const { data: admins, error } = await supabase
	  .from("permission")
	  .select("member_id")  // Select member_id instead of id
	  .eq("role", "admin")
	  .eq("status", "active");
  
	// Log the query result
	console.log("Admin query result:", admins, error);
  
	if (error || !admins) {
	  return JSON.stringify({ error: { message: "Failed to retrieve admin count!" } });
	}
  
	// Prevent deletion if there is only one active admin and the admin to be deleted is the current user
	if (admins.length === 1 && admins[0].member_id === user_id) {
	  return JSON.stringify({ error: { message: "Cannot delete the last administrator!" } });
	}
  
	// Delete the user account
	const supabaseAdmin = await createSupabaseAdmin();
	const deleteResult = await supabaseAdmin.auth.admin.deleteUser(user_id);
  
	if (deleteResult.error?.message) {
	  console.error("Deletion error:", deleteResult.error.message);
	  return JSON.stringify({ error: { message: deleteResult.error.message } });
	} else {
	  // Remove the user from the member table after successful deletion
	  const result = await supabase.from("member").delete().eq("id", user_id);
	  revalidatePath("/dashboard/member");
	  return JSON.stringify(result);
	}
}


export async function readMembers() {
	// Use useUserStore to get the current user information
	unstable_noStore();

	// Create the Supabase client on the server side
	const supabase = await createSupbaseServerClient();
	
	// Fetch data from the "permission" table and also retrieve data from the "member" table (via foreign key relation)
	return await supabase.from("permission").select("* , member(*)");
}
