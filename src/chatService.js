// chatService.js
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from "firebase/firestore";

export const saveChatMessage = async (userId, message, sender = "user") => {
  try {
    await addDoc(collection(db, "chats"), {
      userId,
      message,
      sender, // "user" or "bot"
      timestamp: serverTimestamp()
    });
    console.log("Chat saved successfully.");
  } catch (error) {
    console.error("Error saving chat:", error);
  }
};

export const getChatHistory = async (userId) => {
  try {
    const chatsRef = collection(db, "chats");
    // Try with orderBy first, fallback to without if index doesn't exist
    let q = query(chatsRef, where("userId", "==", userId), orderBy("timestamp", "desc"));
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      // If index error, try without orderBy
      console.warn("Index not found, fetching without orderBy:", indexError);
      q = query(chatsRef, where("userId", "==", userId));
      querySnapshot = await getDocs(q);
    }
    
    const chats = [];
    querySnapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort manually if we couldn't use orderBy
    chats.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      const aTime = a.timestamp.seconds || 0;
      const bTime = b.timestamp.seconds || 0;
      return bTime - aTime; // Descending order (newest first)
    });
    
    return chats;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    // Return empty array on error instead of throwing
    return [];
  }
};
