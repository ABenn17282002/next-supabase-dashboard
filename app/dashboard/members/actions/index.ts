"use server";
import { readUserSession } from "@/lib/actions";
import { createSupabaseAdmin, createSupbaseServerClient } from "@/lib/supabase";
import { unstable_noStore } from "next/cache";
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
			return JSON.stringify(permissionResult)
		}
	}
	
}


export async function updateMemberById(id: string) {
	console.log("update member");
}


export async function deleteMemberById(id: string) {}


export async function readMembers() {
	// Use useUserStore to get the current user information
	unstable_noStore();

	// Create the Supabase client on the server side
	const supabase = await createSupbaseServerClient();
	
	// Fetch data from the "permission" table and also retrieve data from the "member" table (via foreign key relation)
	return await supabase.from("permission").select("* , member(*)");
}
