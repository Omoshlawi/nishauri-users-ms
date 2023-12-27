import { Request } from "express";

export interface UserRequest extends Request {
  user: any; // Adjust the type as needed
}

export interface Service {
  host: string;
  port: number;
  name: string;
  version: string;
  timestamp?: number;
}
