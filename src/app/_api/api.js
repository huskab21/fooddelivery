import axios from "axios";

export const server = axios.create({
  baseURL: "http://localhost:1000",
  headers: { "Content-Type": "application/json" }
});