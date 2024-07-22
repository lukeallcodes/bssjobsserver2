import * as mongodb from "mongodb";

export interface SeverityLevel {
    level: string;
    rate: number;
    contractorrate: number;
    estimatedTime: number;  // Add this line
}

export interface Service {
    servicename: string;
    severities: SeverityLevel[];
    _id: mongodb.ObjectId;
}
