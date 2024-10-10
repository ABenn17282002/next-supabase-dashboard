// `app/api/create-user/route.ts` - サーバーサイドでのみ実行される
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントを`service_role`キーで初期化 (サーバー側のみ)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE! // サーバー側でのみ利用する
);

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

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

  // member テーブルにユーザー情報を追加
  const { error: memberError } = await supabase.from('member').insert({
    id: data.user.id,
    name: "dev_user",
    email:data.user.email
  });

  if (memberError) {
    return NextResponse.json({ error: `Error adding member: ${memberError.message}` }, { status: 400 });
  }

  // permission テーブルに管理者権限を追加
  const { error: permissionError } = await supabase.from('permission').insert({
    id: data.user.id,
    member_id: data.user.id,
    role: 'admin',
    status: 'active'
  });

  if (permissionError) {
    return NextResponse.json({ error: `Error adding permission: ${permissionError.message}` }, { status: 400 });
  }

  return NextResponse.json({ message: 'User created successfully with admin permissions!', data });
}