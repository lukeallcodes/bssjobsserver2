import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database";
import { Job, DateOfService } from "../interfaces/job";

export const jobRouter = express.Router();
jobRouter.use(express.json());

// GET all jobs
jobRouter.get("/", async (_req, res) => {
  try {
    const jobs = await collections.jobs?.find({}).toArray();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json(error instanceof Error ? error.message : "Unknown error");
  }
});

// GET a single job by ID
jobRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const job = await collections.jobs?.findOne({ _id: new ObjectId(id) });
    if (job) {
      res.status(200).json(job);
    } else {
      res.status(404).json(`Failed to find a job: ID ${id}`);
    }
  } catch (error) {
    res.status(500).json(error instanceof Error ? error.message : "Unknown error");
  }
});

// POST a new job
jobRouter.post("/", async (req, res) => {
  try {
    const job: Job = req.body;
    job._id = new ObjectId(); // Ensure _id is generated on the backend
    job.datesOfService.forEach(date => date._id = new ObjectId());
    job.sections.forEach(section => section._id = new ObjectId());
    const result = await collections.jobs?.insertOne(job);
    if (result?.acknowledged) {
      res.status(201).json(job); // Return the created job
    } else {
      res.status(500).json({ message: "Failed to create a new job." });
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
  }
});

// PUT to update an existing job
jobRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedJob: Job = req.body;

    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid job ID');
    }

    // Ensure job ID is an ObjectId
    updatedJob._id = new ObjectId(id);

    // Convert string IDs to ObjectId and ensure they are valid
    updatedJob.datesOfService = updatedJob.datesOfService.map(date => ({
      ...date,
      _id: ObjectId.isValid(date._id) ? new ObjectId(date._id) : new ObjectId()
    }));

    updatedJob.sections = updatedJob.sections.map(section => ({
      ...section,
      _id: ObjectId.isValid(section._id) ? new ObjectId(section._id) : new ObjectId()
    }));

    const query = { _id: new ObjectId(id) };
    const result = await collections.jobs?.updateOne(query, { $set: updatedJob });

    if (result?.matchedCount) {
      res.status(200).json(updatedJob);
    } else {
      res.status(404).json(`Failed to find a job: ID ${id}`);
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
  }
});

// DELETE a job by ID
jobRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await collections.jobs?.deleteOne({ _id: new ObjectId(id) });
    if (result && result.deletedCount) {
      res.status(202).json(`Removed a job: ID ${id}`);
    } else {
      res.status(404).json(`Failed to find a job: ID ${id}`);
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
  }
});

// DELETE a date of service by job ID and date ID
jobRouter.delete("/:jobId/dates/:dateId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const dateId = req.params.dateId;
    const result = await collections.jobs?.updateOne(
      { _id: new ObjectId(jobId) },
      { $pull: { datesOfService: { _id: new ObjectId(dateId) } } }
    );
    if (result?.modifiedCount) {
      res.status(202).json(`Removed a date of service: ID ${dateId}`);
    } else {
      res.status(404).json(`Failed to find a date of service: ID ${dateId}`);
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
  }
});

// PUT to claim a job by contractor
jobRouter.put("/:id/claim", async (req, res) => {
  try {
    const jobId = req.params.id;
    const { contractorId } = req.body;

    const query = { _id: new ObjectId(jobId) };
    const update = { $addToSet: { contractors: new ObjectId(contractorId) } };  // Ensure no duplicate contractor IDs

    const result = await collections.jobs?.updateOne(query, update);

    if (result?.modifiedCount) {
      const updatedJob = await collections.jobs?.findOne(query);
      res.status(200).json(updatedJob);
    } else {
      res.status(404).json(`Failed to find or update job: ID ${jobId}`);
    }
  } catch (error) {
    res.status(400).json(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
  }
});
