import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database";
import { Client } from "../interfaces/client";

export const clientRouter = express.Router();
clientRouter.use(express.json());

// GET all clients
clientRouter.get("/", async (_req, res) => {
    try {
        const clients = await collections.clients?.find({}).toArray();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// GET a single client by ID
clientRouter.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const client = await collections.clients?.findOne({ _id: new ObjectId(id) });
        if (client) {
            res.status(200).json(client);
        } else {
            res.status(404).json(`Failed to find a client: ID ${id}`);
        }
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// POST a new client
clientRouter.post("/", async (req, res) => {
    try {
        const client: Client = req.body;
        client._id = new ObjectId(); // Ensure _id is generated on the backend
        const result = await collections.clients?.insertOne(client);
        if (result?.acknowledged) {
            res.status(201).json(client); // Return the created client
        } else {
            res.status(500).json({ message: "Failed to create a new client." });
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
    }
});

// PUT to update an existing client
clientRouter.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const client: Client = req.body;
        const query = { _id: new ObjectId(id) };

        // Create a new object excluding the _id field
        const { _id, ...clientWithoutId } = client;

        const result = await collections.clients?.updateOne(query, { $set: clientWithoutId });
        if (result?.matchedCount) {
            res.status(200).json(`Updated a client: ID ${id}.`);
        } else {
            res.status(404).json(`Failed to find a client: ID ${id}`);
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// DELETE a client
clientRouter.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections.clients?.deleteOne(query);
        if (result?.deletedCount) {
            res.status(202).json(`Removed a client: ID ${id}`);
        } else {
            res.status(404).json(`Failed to find a client: ID ${id}`);
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? error.message : "Unknown error");
    }
});
