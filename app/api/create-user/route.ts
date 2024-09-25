// `app/api/create-user/route.ts` - サーバーサイドでのみ実行される
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントを`service_role`キーで初期化 (サーバー側のみ)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE! // サーバー側でのみ利用する
);

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // ユーザー作成
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      role: 'admin' // 管理者ロールを指定
    }
  });

  if (error) {
    return NextResponse.json({ error: `Error creating user: ${error.message}` }, { status: 400 });
  }

  return NextResponse.json({ message: 'User created successfully!', data });
}
