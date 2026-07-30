"use client";

import useSWR from "swr";
import { fetchMyTasks, myTasksKey } from "@/lib/tasks-api";

export function useMyTasks(date = "today") {
  return useSWR(myTasksKey(date), () => fetchMyTasks(date), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}
