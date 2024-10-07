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
		.insert({ name: data.name, id: createResult.data.user?.id });

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


export async function updateMemberById(id: string) {
	console.log("update member");
}


export async function deleteMemberById(user_id: string) {

	// call to Session
	const { data: userSession } = await readUserSession();
	
	// admin only
	if (userSession.session?.user.user_metadata.role !== "admin") {
		return JSON.stringify({ error: { message: "You are not allowed to do this!" } });
	}

	// delete account
	const supabaseAdmin = await createSupabaseAdmin();
	const deleteResult = await supabaseAdmin.auth.admin.deleteUser(user_id);
	
	if (deleteResult.error?.message) {
	  return JSON.stringify(deleteResult);
	} else {
	  const supabase = await createSupbaseServerClient();
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
