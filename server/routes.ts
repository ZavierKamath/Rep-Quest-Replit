import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutDataSchema } from "@shared/schema";

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
      console.log("server/routes.ts: Handling GET /api/lifts request");
      
      // Default to user ID 1 for demo
      const userId = 1;
      const lifts = await storage.getLifts(userId);
      console.log(`server/routes.ts: Retrieved ${lifts.length} lifts from storage`);
      
      // Ensure our new lifts are available
      // This is a temporary solution until we properly fix the storage implementation
      const additionalLifts = [
        { 
          id: lifts.length + 1, 
          name: "Push ups", 
          defaultWeight: 0, 
          weightIncrement: 0, 
          userId: null 
        },
        { 
          id: lifts.length + 2, 
          name: "Pull ups", 
          defaultWeight: 0, 
          weightIncrement: 5, 
          userId: null 
        },
        { 
          id: lifts.length + 3, 
          name: "Dumbbell Tricep Extension", 
          defaultWeight: 25, 
          weightIncrement: 5, 
          userId: null 
        },
        { 
          id: lifts.length + 4, 
          name: "Rear Delt Rows on Bench", 
          defaultWeight: 20, 
          weightIncrement: 5, 
          userId: null 
        },
        { 
          id: lifts.length + 5, 
          name: "Machine Preacher Curl", 
          defaultWeight: 40, 
          weightIncrement: 5, 
          userId: null 
        }
      ];
      console.log(`server/routes.ts: Prepared ${additionalLifts.length} additional lifts to add`);
      
      // Check if these lifts already exist by name
      const allLifts = [...lifts];
      let addedCount = 0;
      for (const newLift of additionalLifts) {
        if (!lifts.some(lift => lift.name === newLift.name)) {
          allLifts.push(newLift);
          addedCount++;
        }
      }
      console.log(`server/routes.ts: Added ${addedCount} new lifts to the response`);
      console.log(`server/routes.ts: Returning total of ${allLifts.length} lifts`);
      
      return res.json(allLifts);
    } catch (error) {
      console.error("server/routes.ts: Error fetching lifts:", error);
      return res.status(500).json({ error: "Failed to fetch lifts" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}