import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database";
import { User } from "../interfaces/user";

export const userRouter = express.Router();
userRouter.use(express.json());

// GET all users
userRouter.get("/", async (_req, res) => {
  try {
    const users = await collections.users?.find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error instanceof Error ? error.message : "Unknown error");
  }
});

// GET a single user by ID
userRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await collections.users?.findOne({ _id: new ObjectId(id) });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json(`Failed to find a user: ID ${id}`);
    }
  } catch (error) {
    res.status(500).json(error instanceof Error ? error.message : "Unknown error");
  }
});

// GET users by role
userRouter.get("/role/:role", async (req, res) => {
  try {
    const role = req.params.role as "contractor" | "manager";
    const users = await collections.users?.find({ role }).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error instanceof Error ? error.message : "Unknown error");
  }
});

// POST a new user (signup)
userRouter.post("/signup", async (req, res) => {
  try {
    const user: User = req.body;
    user._id = new ObjectId();
    const result = await collections.users?.insertOne(user);
    if (result?.acknowledged) {
      res.status(201).json(user);
    } else {
      res.status(500).json({ message: "Failed to create a new user." });
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
  }
});

// POST login
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await collections.users?.findOne({ email, password });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json("Invalid email or password");
    }
  } catch (error) {
    res.status(500).json(error instanceof Error ? error.message : "Unknown error");
  }
});

// PUT to update an existing user
userRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user: User = req.body;
    const query = { _id: new ObjectId(id) };

    const { _id, ...userWithoutId } = user;

    const result = await collections.users?.updateOne(query, { $set: userWithoutId });
    if (result?.matchedCount) {
      res.status(200).json(`Updated a user: ID ${id}.`);
    } else {
      res.status(404).json(`Failed to find a user: ID ${id}`);
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? error.message : "Unknown error");
  }
});

// DELETE a user
userRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await collections.users?.deleteOne(query);
    if (result?.deletedCount) {
      res.status(202).json(`Removed a user: ID ${id}`);
    } else {
      res.status(404).json(`Failed to find a user: ID ${id}`);
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? error.message : "Unknown error");
  }
});
