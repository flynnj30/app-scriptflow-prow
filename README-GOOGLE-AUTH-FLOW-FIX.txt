ScriptFlow Pro - Google Sign-In Workflow Fix

Changes:
- Google Sign-In uses Firebase Auth redirect with LOCAL persistence.
- onAuthStateChanged is the single source of truth for the post-login workflow.
- getRedirectResult is used only to surface redirect errors, preventing duplicate data loads.
- The auth modal closes immediately after Firebase confirms the authenticated user.
- User data/subscriptions are initialized once per authenticated UID.
- Sign-out clears the auth workflow state; the auth listener reopens the sign-in modal only after Firebase confirms sign-out.
- Email sign-in follows the same centralized auth-state workflow to avoid duplicate subscriptions.
- Existing CRM, Calendar, Smart Import, Transcript Studio, Analytics, Notifications, Tasks, Team Members, and other features are preserved.

Firebase Console requirements:
1. Authentication > Sign-in method > Google must be enabled.
2. Authentication > Settings > Authorized domains must include the domain where ScriptFlow Pro is hosted.
3. If using a custom domain, ensure the Firebase authDomain remains scriptflow-pro-2cf4c.firebaseapp.com unless you have intentionally configured a custom Firebase auth domain.
