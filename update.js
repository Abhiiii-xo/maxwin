const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

async function updateGame() {
  const gameRef = db.collection("game").doc("current");
  const gameSnap = await gameRef.get();

  let period = 100000;
  if (gameSnap.exists && gameSnap.data().period) {
    period = gameSnap.data().period + 1;
  }

  const startTime = new Date();
  const number = Math.floor(Math.random() * 10); // 0–9

  let color = "violet";
  if (number === 0 || number === 5) color = "violet";
  else if (number % 2 === 0) color = "green";
  else color = "red";

  // Update game current period and time
  await gameRef.set({ period, startTime });

  // Save result
  await db.collection("results").doc(period.toString()).set({
    period,
    number,
    color,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`✅ Period ${period} updated with result ${number} (${color})`);
}

updateGame().catch((err) => {
  console.error("❌ Error updating game:", err);
});
