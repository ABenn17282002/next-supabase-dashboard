"use client";

import { Button } from '@/components/ui/button'
import { TrashIcon } from '@radix-ui/react-icons'
import React, { useTransition } from 'react'
import { deleteTodoById } from '../actions';
import { toast } from '@/components/ui/use-toast';

export default function DeleteTodo({id}:{id: string}) {

    const [isPending, startTransition] = useTransition();
    const onsubmit =() =>{

        startTransition(async () => {
            const result = JSON.parse(await deleteTodoById(id));
            const { error } = result;
            if (result?.error?.message) {
                toast({
                    title: "Fail to delete",
                    description: (
                        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                            <code className="text-white">{error.message}</code>
                        </pre>
                ),
                });
            } else {
                toast({
                    title: "Successfully delete Task"
                });
            }
        });
    }

    return (
        <form action={onsubmit}>
            <Button variant="outline" className="bg-dark dark:bg-inherit">
                <TrashIcon />
                delete
            </Button>
        </form>
    )
}
