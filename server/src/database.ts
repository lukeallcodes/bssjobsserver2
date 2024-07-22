import * as mongodb from "mongodb";
import { Client } from "./interfaces/client";
import { Job, Section } from "./interfaces/job";
import { Service } from "./interfaces/service";
import { User } from "./interfaces/user";

export const collections: {
  clients?: mongodb.Collection<Client>;
  jobs?: mongodb.Collection<Job>;
  sections?: mongodb.Collection<Section>;
  services?: mongodb.Collection<Service>;
  users?: mongodb.Collection<User>;
} = {};

export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db("meanStackExample");
  await applySchemaValidation(db);

  collections.clients = db.collection<Client>("clients");
  collections.jobs = db.collection<Job>("jobs");
  collections.sections = db.collection<Section>("sections");
  collections.services = db.collection<Service>("services");
  collections.users = db.collection<User>("users");
}

async function applySchemaValidation(db: mongodb.Db) {
  // Schema for Client
  const clientSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["clientname", "jobs"],
      additionalProperties: false,
      properties: {
        _id: {},
        clientname: {
          bsonType: "string",
          description: "'clientname' is required and is a string",
        },
        jobs: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              jobTitle: { bsonType: "string" },
              customer: { bsonType: "objectId" },
              totalSquareFootage: { bsonType: "number" },
              serviceType: { bsonType: "object" },
              totalprice: { bsonType: "number" },
              sections: { bsonType: "array" },
              _id: { bsonType: "objectId" },
              startDate: { bsonType: "date" },
              endDate: { bsonType: "date" },
            },
          },
        },
      },
    },
  };

  // Schema for Job
  const jobSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["jobTitle", "customer", "totalSquareFootage", "serviceType", "totalprice", "sections", "datesOfService"],
      additionalProperties: false,
      properties: {
        _id: {},
        jobTitle: {
          bsonType: "string",
          description: "'jobTitle' is required and is a string",
        },
        customer: {
          bsonType: "objectId",
          description: "'customer' is required and is an ObjectId",
        },
        totalSquareFootage: {
          bsonType: "number",
          description: "'totalSquareFootage' is required and is a number",
        },
        serviceType: {
          bsonType: "object",
          description: "'serviceType' is required and is an object",
        },
        totalprice: {
          bsonType: "number",
          description: "'totalprice' is required and is a number",
        },
        sections: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              jobId: { bsonType: "objectId" },
              sectionName: { bsonType: "string" },
              measurements: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  properties: {
                    length: { bsonType: "number" },
                    width: { bsonType: "number" },
                  },
                },
              },
              _id: { bsonType: "objectId" },
            },
          },
        },
        datesOfService: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              date: { bsonType: "date" },
              startTime: { bsonType: "string" },
              endTime: { bsonType: "string" },
              totalTime: { bsonType: "string" },
            },
          },
        },
        contractors: {
          bsonType: "array",
          items: { bsonType: "objectId" },
        },
      },
    },
  };

  // Schema for Section
  const sectionSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["jobId", "sectionName", "measurements"],
      additionalProperties: false,
      properties: {
        _id: {},
        jobId: {
          bsonType: "objectId",
          description: "'jobId' is required and is an ObjectId",
        },
        sectionName: {
          bsonType: "string",
          description: "'sectionName' is required and is a string",
        },
        measurements: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              length: { bsonType: "number" },
              width: { bsonType: "number" },
            },
          },
        },
      },
    },
  };

  // Schema for Service
  const serviceSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["servicename", "rate"],
      additionalProperties: false,
      properties: {
        _id: {},
        servicename: {
          bsonType: "string",
          description: "'servicename' is required and is a string",
        },
        rate: {
          bsonType: "number",
          description: "'rate' is required and is a number",
        },
      },
    },
  };

  // Schema for User
  const userSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "role"],
      additionalProperties: false,
      properties: {
        _id: {},
        email: {
          bsonType: "string",
          description: "'email' is required and is a string",
        },
        password: {
          bsonType: "string",
          description: "'password' is required and is a string",
        },
        role: {
          enum: ["contractor", "manager"],
          description: "'role' is required and is either 'contractor' or 'manager'",
        },
        services: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          description: "'services' is an optional array of service IDs",
        },
      },
    },
  };

  // Apply schema validation to each collection
  await applyCollectionSchema(db, "clients", clientSchema);
  await applyCollectionSchema(db, "jobs", jobSchema);
  await applyCollectionSchema(db, "sections", sectionSchema);
  await applyCollectionSchema(db, "services", serviceSchema);
  await applyCollectionSchema(db, "users", userSchema);
}

async function applyCollectionSchema(db: mongodb.Db, collectionName: string, schema: any) {
  await db.command({
    collMod: collectionName,
    validator: schema,
  }).catch(async (error: mongodb.MongoServerError) => {
    if (error.codeName === "NamespaceNotFound") {
      await db.createCollection(collectionName, { validator: schema });
    }
  });
}
