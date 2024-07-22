import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database";
import { Service } from "../interfaces/service";

export const serviceRouter = express.Router();
serviceRouter.use(express.json());

// GET all services
serviceRouter.get("/", async (_req, res) => {
    try {
        const services = await collections.services?.find({}).toArray();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// GET a single service by ID
serviceRouter.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const service = await collections.services?.findOne({ _id: new ObjectId(id) });
        if (service) {
            res.status(200).json(service);
        } else {
            res.status(404).json(`Failed to find a service: ID ${id}`);
        }
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// POST a new service
serviceRouter.post("/", async (req, res) => {
    try {
        const service: Service = req.body;
        service._id = new ObjectId(); // Ensure _id is generated on the backend
        const result = await collections.services?.insertOne(service);
        if (result?.acknowledged) {
            res.status(201).json(service); // Return the created service
        } else {
            res.status(500).json("Failed to create a new service.");
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
    }
});

// PUT to update an existing service
serviceRouter.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const service: Service = req.body;
        const query = { _id: new ObjectId(id) };

        // Create a new object excluding the _id field
        const { _id, ...serviceWithoutId } = service;

        const result = await collections.services?.updateOne(query, { $set: serviceWithoutId });
        if (result?.matchedCount) {
            res.status(200).json(`Updated a service: ID ${id}.`);
        } else {
            res.status(404).json(`Failed to find a service: ID ${id}`);
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// DELETE a service
serviceRouter.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections.services?.deleteOne(query);
        if (result?.deletedCount) {
            res.status(202).json(`Removed a service: ID ${id}`);
        } else {
            res.status(404).json(`Failed to find a service: ID ${id}`);
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? error.message : "Unknown error");
    }
});
