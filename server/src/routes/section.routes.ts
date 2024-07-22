import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database";
import { Section } from "../interfaces/job";

export const sectionRouter = express.Router();
sectionRouter.use(express.json());

// GET all sections
sectionRouter.get("/", async (_req, res) => {
    try {
        const sections = await collections.sections?.find({}).toArray();
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// GET a single section by ID
sectionRouter.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const section = await collections.sections?.findOne({ _id: new ObjectId(id) });
        if (section) {
            res.status(200).json(section);
        } else {
            res.status(404).json(`Failed to find a section: ID ${id}`);
        }
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// POST a new section
sectionRouter.post("/", async (req, res) => {
    try {
        const section: Section = req.body;
        section._id = new ObjectId(); // Ensure _id is generated on the backend
        const result = await collections.sections?.insertOne(section);
        if (result?.acknowledged) {
            res.status(201).json(`Created a new section: ID ${result.insertedId}.`);
        } else {
            res.status(500).json("Failed to create a new section.");
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// PUT to update an existing section
sectionRouter.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const section: Section = req.body;
        const query = { _id: new ObjectId(id) };
        const result = await collections.sections?.updateOne(query, { $set: section });
        if (result?.matchedCount) {
            res.status(200).json(`Updated a section: ID ${id}.`);
        } else {
            res.status(404).json(`Failed to find a section: ID ${id}`);
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? error.message : "Unknown error");
    }
});

// DELETE a section
sectionRouter.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections.sections?.deleteOne(query);
        if (result?.deletedCount) {
            res.status(202).json(`Removed a section: ID ${id}`);
        } else {
            res.status(404).json(`Failed to find a section: ID ${id}`);
        }
    } catch (error) {
        res.status(400).json(error instanceof Error ? error.message : "Unknown error");
    }
});
