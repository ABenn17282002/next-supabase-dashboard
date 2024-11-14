export type IPermission = {
	email: string | undefined;
    id: string;
    created_at: string;
    role: "user" | "admin";
    status: "active" | "resigned";
    member_id: string;
    member: {
      id: string;
      created_at: string;
      name: string;
      email:string;
    };
};

// Define Todo type and reuse IPermission member structure
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  created_by: string;
  member: IPermission["member"] | IPermission["member"][]; // 配列またはオブジェクト
};