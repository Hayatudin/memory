async function runVerification() {
  const baseUrl = "http://localhost:4000";
  console.log("🚀 Starting Phase 2 Verification Suite...\n");

  // 1. Check Health
  console.log("1️⃣ Testing GET /api/health...");
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = (await healthRes.json()) as any;
  console.log("   Health Response:", JSON.stringify(healthData));
  if (healthRes.status !== 200 || healthData.database !== "connected") {
    throw new Error("Health check failed!");
  }
  console.log("   ✅ Health check passed!\n");

  // 2. Test Sign Up
  const testEmail = `architect_${Date.now()}@memory.app`;
  console.log(`2️⃣ Testing POST /api/auth/sign-up/email with ${testEmail}...`);
  const signupRes = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Architect User",
      email: testEmail,
      password: "SuperSecretPassword123!",
    }),
  });

  const signupData = (await signupRes.json()) as any;
  console.log("   Sign-up Status:", signupRes.status);
  console.log("   Sign-up Data:", JSON.stringify(signupData, null, 2));

  if (signupRes.status !== 200) {
    throw new Error(`Sign-up failed with status ${signupRes.status}`);
  }
  console.log("   ✅ User sign-up passed!\n");

  const token = signupData.token;
  console.log("   Bearer Token Received:", token ? `${token.substring(0, 16)}...` : "None");

  // 3. Test Unauthenticated /api/me
  console.log("3️⃣ Testing GET /api/me without token (Expected: 401 Unauthorized)...");
  const unauthRes = await fetch(`${baseUrl}/api/me`);
  const unauthData = (await unauthRes.json()) as any;
  console.log("   Unauth Status:", unauthRes.status);
  console.log("   Unauth Data:", JSON.stringify(unauthData));
  if (unauthRes.status !== 401) {
    throw new Error("Expected 401 for unauthenticated /api/me");
  }
  console.log("   ✅ Unauthenticated request correctly rejected!\n");

  // 4. Test Authenticated /api/me with Bearer Token
  console.log("4️⃣ Testing GET /api/me with Bearer Token...");
  const authRes = await fetch(`${baseUrl}/api/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const authData = (await authRes.json()) as any;
  console.log("   Auth Status:", authRes.status);
  console.log("   Auth Data:", JSON.stringify(authData, null, 2));

  if (authRes.status !== 200 || !authData.success) {
    throw new Error(`Authenticated /api/me failed: ${JSON.stringify(authData)}`);
  }

  if (authData.data.user.email !== testEmail) {
    throw new Error("User email mismatch!");
  }

  if (!authData.data.profile || authData.data.profile.userId !== authData.data.user.id) {
    throw new Error("Profile auto-creation mismatch!");
  }

  console.log("   ✅ Authenticated GET /api/me passed with auto-created profile!\n");
  // 5. Test Sign In
  console.log("5️⃣ Testing POST /api/auth/sign-in/email with existing credentials...");
  const signinRes = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "SuperSecretPassword123!",
    }),
  });
  const signinData = (await signinRes.json()) as any;
  console.log("   Sign-in Status:", signinRes.status);
  console.log("   Sign-in Token:", signinData.token ? `${signinData.token.substring(0, 16)}...` : "None");
  if (signinRes.status !== 200 || !signinData.token) {
    throw new Error("Sign-in failed!");
  }
  console.log("   ✅ User sign-in passed!\n");

  console.log("🎉 ALL PHASE 2 VERIFICATIONS PASSED SUCCESSFULLY!");
}

runVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
