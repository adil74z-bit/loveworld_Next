# Setup Guide (beginner friendly)

## Part 1: Run the foundation on your computer

1. **Install Node.js** (version 18 or newer) from https://nodejs.org. Choose the "LTS" button.
   Node.js is the tool that lets your computer run the build tools for this project.
2. **Open a terminal** inside the project folder.
   - Windows: open the folder, click the address bar, type `cmd`, press Enter.
   - Mac: right-click the folder and choose "New Terminal at Folder".
3. **Install the project's tools** by typing this and pressing Enter:
   ```
   npm install
   ```
   This downloads Three.js (3D) and Firebase (cloud). It can take a minute.
4. **Start the game:**
   ```
   npm run dev
   ```
5. Open the link it shows (usually http://localhost:5173).
   You should see a loading screen, then a pink spinning cube on green ground.
   Bottom-left shows the FPS number.

To test on your phone: connect it to the same Wi-Fi and open the "Network" link that the terminal prints.

## Part 2: Create your Firebase project (needed from Phase 1)

Do this when you are ready for Google login. It is not needed to see the Phase 0 cube.

1. Go to https://console.firebase.google.com and click **Add project**. Name it something like `loveworld-next`.
2. In the left menu: **Build -> Authentication -> Get started -> Sign-in method -> Google -> Enable**.
3. In the left menu: **Build -> Firestore Database -> Create database**. Start in production mode.
4. Go to **Project settings (gear icon) -> General -> Your apps -> Web (`</>`)**. Register an app. Firebase shows you a block of settings.
5. In this project, copy `.env.example` to a new file named `.env` and paste each value in.
6. In Firestore -> **Rules**, paste the contents of `firestore.rules` and click Publish.
7. Under **Authentication -> Settings -> Authorized domains**, add your future hosting domain (`localhost` is already allowed).

Never share or commit your `.env` file. It is already listed in `.gitignore`.
