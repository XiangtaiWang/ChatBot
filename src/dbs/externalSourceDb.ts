import { getFirestoreDb } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
const db = getFirestoreDb()
const collectionId = "ChatbotExternalSource"

export const getExternalSources = async (uid:string, chatbotId:string)=>{
    const docRef = doc(db, collectionId, uid, "chatbots", chatbotId);
    const docSnap = await getDoc(docRef);
    let sources = docSnap.data()!['sources']
    // console.log(sources);
    // sources.forEach(source => {
    //     source.title = source.title
    //     .replace(/^"|"$/g, '') // 去除两端双引号
    //     .replace(/\\"/g, '"')      // 替换转义后的双引号
    //     .replace(/\\'/g, "'");     // 替换转义后的单引号
    // });
    // console.log(sources);
    return sources
}




