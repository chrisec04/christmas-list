/*
  SHARED DATABASE SETTINGS

  Until you paste your Firebase settings here, the site runs in "test mode":
  claims are saved only in the browser you are using, and nobody else sees them.

  To connect the shared database:
    1. In the Firebase console, open your project, then Project settings.
    2. Under "Your apps", add a Web app and copy its firebaseConfig values.
    3. Replace `null` below with those values, for example:

       window.FIREBASE_CONFIG = {
         apiKey: "...",
         authDomain: "...",
         databaseURL: "https://your-project-default-rtdb.firebaseio.com",
         projectId: "...",
         appId: "..."
       };

  These values are meant to be public. They are not passwords.
*/
window.FIREBASE_CONFIG = null;
