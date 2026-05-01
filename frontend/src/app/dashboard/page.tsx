"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   api.get("/user").then((res) => setUser(res.data));
  // }, []);

  return <div>Hello, {user?.name}</div>;
}
