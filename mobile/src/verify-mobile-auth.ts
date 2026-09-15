import { AuthService } from "./services/authService";
import { Storage } from "./services/storage";
import { useAuthStore } from "./store/authStore";

declare const process: any;

async function runMobileAuthVerification() {
  console.log("📱 Running Mobile App Auth & API Integration Suite...\n");

  // 1. Verify Backend Connectivity from Mobile Client
  console.log("1️⃣ Checking Backend Connectivity via AuthService.checkHealth()...");
  const health = await AuthService.checkHealth();
  console.log("   Health response:", JSON.stringify(health));
  if (health.status !== "ok") {
    throw new Error("Backend is not responding properly");
  }
  console.log("   ✅ Backend is reachable from mobile layer!\n");

  // 2. Test User Sign-Up via AuthService
  const testEmail = `mobile_user_${Date.now()}@memory.app`;
  console.log(`2️⃣ Testing AuthService.signUp() with ${testEmail}...`);
  const signupResult = await AuthService.signUp({
    name: "Mobile Explorer",
    email: testEmail,
    password: "Password123!",
  });
  console.log("   Sign-up success! User ID:", signupResult.user.id);
  console.log("   Token received:", `${signupResult.token.substring(0, 16)}...`);

  // 3. Verify Token Persistence in Storage
  const savedToken = await Storage.getToken();
  console.log("   Stored Token:", savedToken ? `${savedToken.substring(0, 16)}...` : "None");
  if (!savedToken || savedToken !== signupResult.token) {
    throw new Error("Token persistence verification failed!");
  }
  console.log("   ✅ Token persisted in Storage!\n");

  // 4. Test Authenticated Profile Retrieval via AuthService.getMe()
  console.log("3️⃣ Testing AuthService.getMe() with stored Bearer token...");
  const meData = await AuthService.getMe();
  console.log("   Fetched User:", meData.user.name, `(${meData.user.email})`);
  console.log("   Fetched Profile:", meData.profile?.displayName, `(timezone: ${meData.profile?.timezone})`);
  if (meData.user.email !== testEmail) {
    throw new Error("User email mismatch!");
  }
  console.log("   ✅ Authenticated user & profile successfully retrieved!\n");

  // 5. Test Sign-Out
  console.log("4️⃣ Testing AuthService.signOut()...");
  await AuthService.signOut();
  const tokenAfterSignOut = await Storage.getToken();
  console.log("   Token after signout:", tokenAfterSignOut);
  if (tokenAfterSignOut !== null) {
    throw new Error("Token should be cleared after signout!");
  }
  console.log("   ✅ Sign-out cleared session and stored token!\n");

  // 6. Test Sign-In via Zustand Store
  console.log("5️⃣ Testing useAuthStore.login()...");
  const store = useAuthStore.getState();
  const loginSuccess = await store.login({
    email: testEmail,
    password: "Password123!",
  });

  const stateAfterLogin = useAuthStore.getState();
  console.log("   Login success:", loginSuccess);
  console.log("   store.isAuthenticated:", stateAfterLogin.isAuthenticated);
  console.log("   store.user:", stateAfterLogin.user?.name);
  console.log("   store.token:", stateAfterLogin.token ? `${stateAfterLogin.token.substring(0, 16)}...` : "None");

  if (!loginSuccess || !stateAfterLogin.isAuthenticated) {
    throw new Error("useAuthStore.login failed!");
  }
  console.log("   ✅ useAuthStore successfully manages authenticated state!\n");

  // 7. Test Logout via Zustand Store
  console.log("6️⃣ Testing useAuthStore.logout()...");
  await stateAfterLogin.logout();
  const stateAfterLogout = useAuthStore.getState();
  console.log("   store.isAuthenticated after logout:", stateAfterLogout.isAuthenticated);
  console.log("   store.user after logout:", stateAfterLogout.user);
  if (stateAfterLogout.isAuthenticated !== false || stateAfterLogout.user !== null) {
    throw new Error("useAuthStore.logout failed to clear state!");
  }
  console.log("   ✅ useAuthStore logout successfully reset state!\n");

  console.log("🎉 ALL MOBILE AUTH & API INTEGRATION TESTS PASSED!");
}

runMobileAuthVerification().catch((err) => {
  console.error("❌ Mobile auth verification failed:", err);
  process.exit(1);
});
