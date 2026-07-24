// src/firebase.js
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// Đoạn cấu hình lấy từ Firebase Console của bạn
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.warn("⚠️ CẢNH BÁO: Chưa cấu hình VITE_FIREBASE_API_KEY trong file .env! Hãy điền thông tin Firebase vào file .env và khởi động lại Vite server.");
}

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Xuất các dịch vụ ra để các file khác import vào dùng
export const auth = getAuth(app);
export const db = getFirestore(app);