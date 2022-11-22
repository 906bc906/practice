// CSR: 'use client';

import React from 'react'
import { Todo } from '../../../typings';
import { notFound } from 'next/navigation'

//generateStaticParams 에 의해 생성되지 않은 dynamic sgement 에 방문했을 때의 행동을 정의함
//true: default, create page on demand via SSR
//false: return 404 error
export const dynamicParams = true;

type PageProps = {
  params: {
    todoId: string;
  };
};

const fetchTodo = async (todoId: string) => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId}`,
    { next: { revalidate: 60 } } //ISR, 60초 동안 이 페이지를 사용, 이후 요청에 재생성
    //SSR explicilty: cache: "no-cache"
    //SSG: cache: "force-cache"
  );

  const todo: Todo = await res.json();
  return todo; 
}

async function TodoPage({ params: { todoId }}: PageProps) {
  const todo = await fetchTodo(todoId);

  if (!todo.id) return notFound();

  return (
    <div className="p-10 bg-yellow-200 border-2 m-2 shadow-lg">
      <p>
        #{todo.id}: {todo.title}
      </p>
      <p>Completed: {todo.completed ? "Yes" : "No"}</p>
      
      <p className="border-t border-black mt-5 text-right">
        By User: {todo.userId}
      </p>
    </div>
  )
}
export default TodoPage

export async function generateStaticParams() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/");
  const todos: Todo[] = await res.json();

  //10 페이지만 prebuild함- 200개씩 API 날렸다가 API 제한 먹는걸 피하기 위해
  const trimmedTodos = todos.splice(0, 10);

  return trimmedTodos.map((todo) => ({
    todoId: todo.id.toString(),
  }));
}