import { db } from "./firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";
import fs from 'fs';

export const plantMissions = async (jsonFilePath) => {
  const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  const ticketsRef = collection(db, "tickets");

  console.log("🐝 SCOUT BEE: Preparing to plant missions...");

  for (const mission of data) {
    try {
      await addDoc(ticketsRef, {
        ...mission,
        timestamp: mission.timestamp || new Date().toISOString(),
        status: mission.status || "Backlog",
        workLog: mission.workLog || ["[SYSTEM] Mission imported via Bulk Intake."]
      });
      console.log(`✅ PLANTED: ${mission.displayId} - ${mission.title}`);
    } catch (e) {
      console.error(`❌ FAILED: ${mission.displayId}`, e);
    }
  }
  console.log("🌻 ALL MISSIONS PLANTED.");
};