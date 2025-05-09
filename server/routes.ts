import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutDataSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get workout data for a user
  app.get("/api/workout-data/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const workoutData = await storage.getWorkoutData(userId);
      
      if (workoutData) {
        return res.json(workoutData.data);
      } else {
        return res.json(null);
      }
    } catch (error) {
      console.error("Error fetching workout data:", error);
      return res.status(500).json({ error: "Failed to fetch workout data" });
    }
  });
  
  // Save workout data for a user
  app.post("/api/workout-data", async (req: Request, res: Response) => {
    try {
      const validationResult = insertWorkoutDataSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid workout data", details: validationResult.error });
      }
      
      const workoutData = await storage.saveWorkoutData(validationResult.data);
      return res.json(workoutData);
    } catch (error) {
      console.error("Error saving workout data:", error);
      return res.status(500).json({ error: "Failed to save workout data" });
    }
  });
  
  // Sync workout data with Google Drive (placeholder)
  app.post("/api/sync-drive", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would handle Google Drive sync
      // For this demo, we just return success
      return res.json({ success: true, message: "Sync completed" });
    } catch (error) {
      console.error("Error syncing with Google Drive:", error);
      return res.status(500).json({ error: "Failed to sync with Google Drive" });
    }
  });
  
  // Get available lifts
  app.get("/api/lifts", async (req: Request, res: Response) => {
    try {
      // Default to user ID 1 for demo
      const userId = 1;
      const lifts = await storage.getLifts(userId);
      return res.json(lifts);
    } catch (error) {
      console.error("Error fetching lifts:", error);
      return res.status(500).json({ error: "Failed to fetch lifts" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
