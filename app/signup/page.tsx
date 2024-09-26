'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// Zodスキーマでバリデーションを定義
const signUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

type SignUpFormData = {
  email: string;
  password: string;
};

export default function SignUpPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // useForm を使用してフォームの状態管理
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ユーザー作成の処理
  const createUser: SubmitHandler<SignUpFormData> = async (data) => {
    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(result.message);
        toast({ title: "User created successfully!" });
      } else {
        setError(result.error);
        toast({ title: "Error creating user", description: result.error });
      }
    } catch (error) {
      setError('Error occurred during user creation');
      toast({ title: "Error", description: "An error occurred during user creation." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen"> {/* フレックスボックスで中央配置 */}
      <div className="w-96 mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createUser)} className="space-y-6">
            <h1 className="text-2xl font-semibold">Create User</h1>
  
            {/* Email フィールド */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                </FormItem>
              )}
            />
  
            {/* Password フィールド */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                </FormItem>
              )}
            />
  
            {/* Submit ボタン */}
            <Button type="submit" className="w-full">
              Create User
            </Button>
  
            {message && <p className="text-green-500 mt-2">{message}</p>}
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        </Form>
      </div>
    </div>
  );
  
}
