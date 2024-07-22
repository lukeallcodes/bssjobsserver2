import { ObjectId } from "mongodb";
import { Service, SeverityLevel } from "./service";

export interface Job {
  ponumber?: number;
  jobTitle: string;
  customer: ObjectId; // Customer ID stored in client collection
  totalSquareFootage: number;
  totalprice: number;
  sections: Section[]; // Sections in the job
  datesOfService: DateOfService[]; // Dates of service for the job
  contractors?: ObjectId[]; // User IDs of contractors assigned to the job
  numberofcontractors: number;
  isRecurring: boolean; // Indicates if the job is recurring
  contractorTotalPay: number; // Total contractor pay
  contractorRate: number; // Contractor rate
  _id: ObjectId;
}

export interface Section {
  jobId: ObjectId;
  totalTime: number;  // Total time for the section
  sectionName: string;
  serviceType: Service;
  severityLevel: string;
  severityLevels: SeverityLevel[]; // Severity levels for the section
  measurements: Measurement[]; // Measurements for the section
  _id: ObjectId;
  totalprice?: number; // Calculated total price for the section
  contractorPay?: number; // Calculated contractor pay for the section
}

export interface Measurement {
  length: number;
  width: number;
}

export interface DateOfService {
  _id: ObjectId; // Date of service ID
  date: Date;
  startTime: string; // Format: 'HH:mm'
  endTime: string; // Format: 'HH:mm'
  totalTime: string; // Format: 'HH:mm'
}
