ScriptFlow Pro — Firestore permissions fix

The reported errors were caused by Firestore Security Rules denying access to:
- users/{uid}/teamMembers
- users/{uid}/tasks
- users/{uid} (the main user document used by loadUserData)

The application has also been hardened so an optional collection permission/network failure no longer aborts the entire data load. Tasks and team members fall back to local/default data when a stream cannot be opened.

IMPORTANT: deploy the included FIRESTORE-RULES-COMPLETE.txt (merge it with any unrelated application collections you use).

Recommended deployment:
  firebase deploy --only firestore:rules

After publishing the rules, sign out/in once or hard refresh the app so the Firebase listeners are recreated.

The rules are scoped to the authenticated user's UID. They do not grant one user access to another user's data.
