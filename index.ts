import { serve } from "https://deno.land/std@0.158.0/http/server.ts";

const getTodoList = () => {
  const getLocal = localStorage.getItem("list");
  const todoList: string[] = JSON.parse(getLocal || "[]");
  return todoList;
};

const handlePost = async (req: Request) => {
  const todoList = getTodoList();
  const formData = await req.formData();
  const todo = formData.get("todo")?.toString();
  if (todo) {
    todoList.push(todo);
    localStorage.setItem("list", JSON.stringify(todoList));
  }
  return Response.redirect(req.url);
};

const handleGet = () => {
  const todoList = getTodoList();

  const renderView = todoList.map(
    (val, index) =>
      `<form action="/delete" method="POST">${val} <button type="submit" name="index" value="${index}">delete</button></form>`
  );

  return new Response(
    `<form action="/" method="POST">
  <input type="text" name="todo" placeholder="Add todo">
</form>
${renderView.join("")}`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    }
  );
};

const handleDelete = async (req: Request) => {
  const todoList = getTodoList();
  const formData = await req.formData();
  const index = formData.get("index")?.toString();
  if (index) {
    todoList.splice(parseInt(index), 1);
    localStorage.setItem("list", JSON.stringify(todoList));
  }
  return Response.redirect(req.url.replace(/delete/, ""));
};

serve(async (req: Request) => {
  if (req.method === "POST" && req.url.match(/delete/)) {
    return await handleDelete(req);
  }

  if (req.method === "POST") {
    return await handlePost(req);
  }

  if (req.method === "GET") {
    return handleGet();
  }

  return new Response("404: Not Found!", {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
});
