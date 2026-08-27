// ============================================================================
// Firebase istemci kurulumu -- Tahmin Ligi modülü için
// ============================================================================
// NOT: Bu config buraya BİLEREK aynen yapıştırıldı -- Firebase web SDK'sının
// `apiKey` alanı bir "sır" (secret) DEĞİLDİR, tarayıcıya gönderilen her
// Firebase web uygulamasının paketinde zaten açıkça bulunur. Gerçek erişim
// kontrolü Firestore Security Rules (bkz. firestore.rules) ve Authentication
// ile sağlanır, bu dosyanın gizli tutulmasıyla DEĞİL.
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoQXivWPpyOhKp9T-Bo82VJxNFlnG3H7U",
  authDomain: "ucls-37598.firebaseapp.com",
  projectId: "ucls-37598",
  storageBucket: "ucls-37598.firebasestorage.app",
  messagingSenderId: "730528515838",
  appId: "1:730528515838:web:1211ff741c00bd9d9547af",
  measurementId: "G-W8H3ZD1WKT",
};

// getApps().length kontrolü: Vite dev sunucusunda HMR (hot module reload)
// bu dosyayı birden fazla kez çalıştırabilir -- initializeApp'i tekrar
// çağırmak hataya yol açar, bu yüzden zaten bir app varsa onu yeniden
// kullanıyoruz.
export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
