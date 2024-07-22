import * as mongodb from "mongodb";
import { Job } from "./job";

export interface Client{

    clientname: string;
    jobs: Job[];
    _id: mongodb.ObjectId;

}