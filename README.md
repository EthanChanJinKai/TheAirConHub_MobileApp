# TheAirConHub_MobileApp

**Full Installation Guide**

This guide provides the step-by-step process to clone an existing React Native application, which uses dependencies like lucide-react-native and @react-navigation/bottom-tabs, and run it in Expo Go on your mobile device.

Step 1: Install Core Development Tools

The first step is installing the foundational software required for all JavaScript and source control development.

1. Install Node.js (and npm/npx)

Node.js is the JavaScript runtime environment, and npm (Node Package Manager) is used to install libraries and manage dependencies. npx is included with npm and is essential for running the Expo CLI commands.

Go to the official Node.js website.

Download and install the LTS (Long-Term Support) version. Follow the installation wizard, accepting all default settings.

2. Install Visual Studio Code

VS Code is the recommended text editor for React Native development.

Go to the VS Code website.

Download and install the appropriate version for your operating system.

3. Install Git

Git is required to clone the project from GitHub.

Go to the official Git website.

Download and install the appropriate version for your operating system.

4. Install Expo Go on Your Mobile Device

The Expo Go app is required to test the application on your physical device.

Open the app store on your smartphone (App Store for iOS, Google Play for Android).

Search for and install the Expo Go app.

Step 2: Clone the Expo Project from GitHub

Now we'll use the command line (Terminal on Mac/Linux, Command Prompt/PowerShell on Windows) to download the project files.

1. Open VS Code and Terminal

Open Visual Studio Code.

Go to Terminal -> New Terminal (or press Ctrl + Shift + `). This opens a terminal directly inside VS Code.

2. Clone the Project Repository

Use git clone with the repository URL to download the code.

git clone [https://github.com/YourUsername/HomeServicesApp.git](https://github.com/YourUsername/HomeServicesApp.git)


Note: Replace https://github.com/YourUsername/HomeServicesApp.git with the actual URL of the repository you wish to clone.

Navigate into your new project folder:

cd HomeServicesApp


Step 3: Install Required Dependencies

Since the project already exists, you just need to run npm install to download all necessary libraries defined in the package.json file (including React Navigation and Lucide Icons).

Ensure your Terminal is inside the project directory (HomeServicesApp).

Run the installation command:

npm install


Step 4: Verify Project Structure

The app logic should reside in the main file of your project.

In VS Code, open the HomeServicesApp folder you just cloned.

Verify that the core application code is present in the file named App.js or App.jsx.

Step 5: Run the Application

You are now ready to start the development server.

Ensure your Terminal is still inside the HomeServicesApp directory (cd HomeServicesApp).

Run the Expo start command:

npx expo start


The Expo Developer Tools will open in your web browser, and a QR code will appear in both the browser and the Terminal.

Step 6: View on Your Mobile Device

Open the Expo Go app on your smartphone.

Use the built-in scanner within the Expo Go app to scan the QR code displayed in your VS Code Terminal or web browser.

The app will bundle and load, and your Home Services App should appear on your phone, fully functional, allowing you to navigate between the Home, Bookings, Rewards, and Account tabs.
