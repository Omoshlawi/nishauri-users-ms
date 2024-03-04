import { User } from "@prisma/client";
import { Request } from "express";

export interface Service {
  host: string;
  port: number;
  name: string;
  version: string;
  timestamp?: number;
}

export interface UserRequest extends Request {
  user: any;
}

export interface Entity {
  id?: string | number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Repository<T> {
  create(entity: T): Promise<T>;
  findOneById(id: string): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  findByCriteria(criteria: Record<string, any>): Promise<T[]>;
  updateById(id: string, updates: Partial<T>): Promise<T | undefined>;
  deleteById(id: string): Promise<void>;
}

export abstract class BaseEntity implements Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export interface NotFoundException {
  status: 404;
  errors: {
    detail: string;
  };
}
export interface ValidationException {
  status: 400;
  errors: Record<string, any>;
}

export interface TokenPayload {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  image?: string;
  type: "refresh" | "access";
}
