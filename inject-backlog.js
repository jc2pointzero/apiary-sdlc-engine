import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Your Hardcoded Config (Matching your firebaseConfig.js)
const firebaseConfig = {
  apiKey: "AIzaSyDDcRYiCrrpyzUFIESePGTD2b1SKzl2MPE",
  authDomain: "greenstack-13c6a.firebaseapp.com",
  projectId: "greenstack-13c6a",
  storageBucket: "greenstack-13c6a.appspot.com",
  messagingSenderId: "804673641042",
  appId: "1:804673641042:web:715d398e285d898517228a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const legacyTickets = [
  {
    title: "Ticket #052: Optical Scaling Engine",
    priority: "High",
    isChindogu: false,
    displayId: "T-9501",
    status: "Backlog",
    notes: "Implement (Plant Px / Barcode Px) * 20 math for CM conversion."
  },
  {
    title: "Ticket #053: Hive Manifest Utility",
    priority: "Med",
    isChindogu: true,
    displayId: "T-9502",
    status: "Backlog",
    notes: "Create Deep Scan zip/JSON export for AI analysis."
  },
  {
    title: "Ticket #064: Seed Bank Reconciliation",
    priority: "High",
    isChindogu: false,
    displayId: "T-9503",
    status: "Backlog",
    notes: "Merge duplicate 'seedbank' and 'seed_bank' collections."
  },
  {
    title: "Ticket #065: State-Machine Status Toggle",
    priority: "High",
    isChindogu: false,
    displayId: "T-9504",
    status: "Backlog",
    notes: "Enable status cycling (Backlog -> In Progress -> Done) in UI."
  },
  {
    title: "Ticket #066: The Waggle Dance",
    priority: "Low",
    isChindogu: true,
    displayId: "T-9505",
    status: "Backlog",
    notes: "Sync Bee animations to real-time Firestore events."
  }
];

const inject = async () => {
  console.log("🐝 BUILDER: Beginning Legacy Intake...");
  for (const ticket of legacyTickets) {
    try {
      const docRef = await addDoc(collection(db, "tickets"), {
        ...ticket,
        timestamp: new Date().toISOString()
      });
      console.log(`✅ Injected: ${ticket.title} (ID: ${docRef.id})`);
    } catch (e) {
      console.error(`🚨 Error injecting ${ticket.title}:`, e);
    }
  }
  console.log("🏁 Mission Complete. All tickets in Hive.");
  process.exit();
};

inject();