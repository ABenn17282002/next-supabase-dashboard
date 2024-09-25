"use server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { json } from "stream/consumers";


export async function createMember(data: {
	email: string;
	password: string;
	name: string;
	role: "user" | "admin";
	status: "active" | "resigned";
	confirm: string;
}) {
	
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
export async function readMembers() {}
