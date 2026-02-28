// agent-worker.js — Sammie Hive Protocol Ground Station
// ✅ FIX: Anchor pattern updated to match BEE_HOOK format: // [BEE_HOOK: NAME] / // [BEE_HOOK_END]
// ✅ FIX: File-not-found now creates parent directories before write (new file support)
// ✅ FIX: Status update to "Done" now fires AFTER the 5s hover, not before
// ✅ BEE_HOOKs installed for future surgical pollination of the worker itself

import { initializeApp }    from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import fs   from 'fs';
import path from 'path';

// [BEE_HOOK: WORKER_FIREBASE_CONFIG]
const firebaseConfig = {
  apiKey:            "AIzaSyDDcRYiCrrpyzUFIESePGTD2b1SKzl2MPE",
  authDomain:        "greenstack-13c6a.firebaseapp.com",
  projectId:         "greenstack-13c6a",
  storageBucket:     "greenstack-13c6a.appspot.com",
  messagingSenderId: "804673641042",
  appId:             "1:804673641042:web:715d398e285d898517228a",
};
// [BEE_HOOK_END]

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// [BEE_HOOK: WORKER_PROJECT_ROOTS]
const projectRoots = {
  "GreenStack": "C:/AI Projects/GreenStack 3.0/src",
  "Apiary":     "C:/AI Projects/apiary/src",
};
// [BEE_HOOK_END]

// ─── Anchor Patterns ──────────────────────────────────────────────────────────
// Matches both JSX comments and JS comments:
//   // [BEE_HOOK: NAME]        ← JS / JSX line comment
//   {/* [BEE_HOOK: NAME] */}   ← JSX block comment (also supported)

const makeHook    = (name) => `// [BEE_HOOK: ${name}]`;
const makeHookEnd = ()     => `// [BEE_HOOK_END]`;

console.log("🐝 BUILDER BEE: Hive Ground Station Online. Watching for Pollen...");

// ─── Ticket Watcher ───────────────────────────────────────────────────────────

// [BEE_HOOK: WORKER_TICKET_QUERY]
const q = query(collection(db, "tickets"), where("status", "==", "In Progress"));
// [BEE_HOOK_END]

// Track which log entries we've already processed to avoid re-firing on re-snapshots
const processedLogs = new Set();

// [BEE_HOOK: WORKER_SNAPSHOT_HANDLER]
onSnapshot(q, async (snap) => {
  for (const tDoc of snap.docs) {
    const ticket  = tDoc.data();
    const lastLog = ticket.workLog?.[ticket.workLog.length - 1] || "";

    // Skip if already processed or not a deploy command
    if (!lastLog.includes("[DEPLOY_CODE]") || processedLogs.has(lastLog)) continue;
    processedLogs.add(lastLog);

    try {
      await pollinate(tDoc.id, ticket, lastLog);
    } catch (err) {
      console.error(`❌ POLLINATION FAILED [${tDoc.id}]:`, err.message);
      await updateDoc(doc(db, "tickets", tDoc.id), {
        workLog: arrayUnion(`[ERROR] ${err.message}`),
      });
    }
  }
});
// [BEE_HOOK_END]

// ─── Core Pollination Logic ───────────────────────────────────────────────────

// [BEE_HOOK: WORKER_POLLINATE_FN]
async function pollinate(ticketId, ticket, logEntry) {
  // Parse the structured payload
  const payload      = logEntry.split("[DEPLOY_CODE]")[1].trim();
  const fileNameMatch = payload.match(/filename:\s*(.*?)\s*\|/);
  const anchorMatch   = payload.match(/anchor:\s*(.*?)\s*\|/);
  const codePart      = payload.split("code:")[1]?.trim();

  if (!fileNameMatch) throw new Error("Missing filename in payload");
  if (!codePart)      throw new Error("Missing code in payload");

  const fileName     = fileNameMatch[1].trim();
  const anchorName   = anchorMatch ? anchorMatch[1].trim() : "NONE";
  const codeContent  = codePart;
  const projectKey   = ticket.project || "GreenStack";
  const projectRoot  = projectRoots[projectKey];

  if (!projectRoot) throw new Error(`Unknown project key: "${projectKey}"`);

  const fullPath = path.join(projectRoot, fileName);
  console.log(`\n🐝 Pollinating: ${fileName} @ anchor: ${anchorName}`);

  // Ensure parent directory exists
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   📁 Created directory: ${dir}`);
  }

  let newFileContent = "";

  // [BEE_HOOK: WORKER_ANCHOR_INJECT]
  if (anchorName && anchorName !== "NONE") {
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found for anchor injection: ${fullPath}`);
    }
    const currentContent = fs.readFileSync(fullPath, 'utf8');
    const hook    = makeHook(anchorName);
    const hookEnd = makeHookEnd();

    if (!currentContent.includes(hook)) {
      throw new Error(`Anchor [BEE_HOOK: ${anchorName}] not found in ${fileName}`);
    }

    // Replace everything BETWEEN the hook and hook-end with new code
    const [before, afterHook]     = currentContent.split(hook);
    const [_oldBody, afterHookEnd] = afterHook.split(hookEnd);

    newFileContent = `${before}${hook}\n${codeContent}\n${hookEnd}${afterHookEnd}`;
  } else {
    // Full file overwrite (anchor = NONE)
    newFileContent = codeContent;
  }
  // [BEE_HOOK_END]

  // Write the pollinated file
  fs.writeFileSync(fullPath, newFileContent, 'utf8');
  console.log(`✅ POLLINATION SUCCESS: ${fileName}`);

  // 🐝 HOVER: Keep Sammie visible in GreenStack for 5s UAT
  console.log("⏳ Sammie is hovering so you can see the change in GreenStack...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Mark done AFTER the hover (✅ FIX: was firing immediately before)
  await updateDoc(doc(db, "tickets", ticketId), {
    status:  "Done",
    workLog: arrayUnion(`[SUCCESS] Pollinated ${fileName} @ ${anchorName}`),
  });
  console.log(`🏁 Ticket ${ticketId} marked Done.`);
}
// [BEE_HOOK_END]
