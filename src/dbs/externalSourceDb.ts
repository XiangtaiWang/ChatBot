import { getFirestoreDb } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
const db = getFirestoreDb()
const collectionId = "ChatbotExternalSource"

export const getExternalSources = async (chatbotId:string)=>{
    const docRef = doc(db, collectionId, chatbotId);
    const docSnap = await getDoc(docRef);
    let sources = docSnap.data()!['sources']

    return sources
}




