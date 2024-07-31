import axios from "axios";
import { QueryClient } from "@tanstack/react-query";
import { createInstance } from "@/lib/utils";

export const api = axios.create({
  baseURL: "http://localhost:3000/",
});

export const queryClient = createInstance(QueryClient);
