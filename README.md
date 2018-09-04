# View a video demo of this project by clicking link below
    https://youtu.be/uT0sNpiAKnM

# How to get up and running as quickly as possible

## Setting up Development Environment

##PLEASE NOTE
This project will not work straight from a clone as all keys tying to the firestore backend have been removed. Please follow the steps provided by Firebase to get up and running. For complete video tutorial please visit: https://www.coded-colors.com/ 
## Pre-Requisites
If you don't know anything about Git, then please read this: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics and become intimately familiar with it, since this is your primary workhorse.

### Core Environment
1. Download and install node.js.
2. Check that both node and npm have been correctly installed by typing:
    - node -v
    - npm -v
3. Install all the following:
    - npm install -g typescript
    - npm install -g @angular/cli
    - npm install -g ionic
    - npm install -g cordova
4. Install a javascript/typescript editor, such as VSCode.
5. During development, is recommended that you use the Chrome Browser due to the number of built in tools.
6. After a fresh clone of the project, go into the folder and type the following in order to download all dependencies:
    - npm i

### Setting Up Android Environment
1. Download Android Studio
2. Create a simple, empty project.
3. Click "Run"
4. When prompted, set up a virtual machine and accept the SDK 26 license.
5. Also configure your Android device to connect via USB (this is the recommended development path)
6. Set up your Android device to be in debug mode.

### Setting Up the iOS Environment
1. download Xcode onto your computer
2. follow these insturctions https://ionicframework.com/docs/intro/deploying/ to open ionic app code in Xcode
3. Connect your phone to the computer to download app onto your phone.
4. no developer account needed to download app onto your own device

# Running the code in a web browser
The easiest way to build and run the code is to run the ionic server to monitor your code directory and automatically
update your output window.  To do so, simply type:

- ionic serve --lab

This will do multiple things:

1. Initialize the ionic web service (for example http://localhost:4200)
2. Build your code.
3. Run your application inside the Ionic Lab portal, which will allow you to display both thee android and ios projects, simultaneously.
4. Monitor your code for changes, and automatically refresh the Ionic Lab portal.

Alternatively, you can just type:

- ionic serve

But this will only run your code in a standard chrome window.

# Emulating your code
You can alternatively choose to run your code inside a phone emulator built by either Google (for Android), or Apple (for iOS). To do so,
and assuming that you correctly set up your targets above, type one of:

- ionic cordova run android --emulator
- ionic cordova run ios --emulator

By default, the above commands will only start up the default emulation image.  If you don't have one, then you can specify
it in the command line by adding the --target=<name of image>. For example, if you are developing in Android and you have
multiple images for the emulator (Nexus5, and Pixel2), then you can specify the image:

- ionic cordova run android --emulator --target="Pixel2"

# Deploying your code
To deploy your code into your actual device, simply ensure that you've installed the appropriate mobile SDK kit (see Android and iOS sections above),
make sure that your phone is plugged in via USB, and then type one of the folloing:

- ionic cordova run android --device
- ionic cordova run ios --device


# Editor
You can choose any number of editors to develop Typescript/Angular/Ionic code. However, it is HIGHLY recommended that you choose one of Atom or Visual Studio Code.




