import * as mongodb from "mongodb";

export interface User {
  email: string;
  password: string;
  role: "contractor" | "manager";
  services?: string[]; // Add services
  _id?: mongodb.ObjectId;
}
