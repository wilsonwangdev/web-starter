import type { TranslationMessages } from "../schema.ts";

export const en: TranslationMessages = {
  install: {
    title: "Add to your device",
    description:
      "Open from your desktop or home screen. A connection is still needed. Content does not sync, and the installed app may use separate browser storage.",
    available: "This browser can install the app. You can add it now.",
    pending: "Continue in your browser’s installation dialog.",
    requested:
      "Installation was requested. Open the app from your device once installation finishes.",
    installed: "The app is open in its own window, or the browser has confirmed installation.",
    manual:
      "If supported, choose Install app or Add to Home Screen from your browser menu. On iPhone, use the Safari share menu.",
    install: "Install on device",
    failed: "The installation dialog could not open. Try again later or use your browser menu.",
  },
  nav: {
    home: "Home",
    workspace: "Workspace",
    preferences: "Preferences",
    skip: "Skip to content",
    main: "Main navigation",
  },
  common: { close: "Close", loading: "Opening…", backHome: "Back to home" },
  home: {
    eyebrow: "A little room for your next idea",
    title: "Turn an idea into a next step.",
    description:
      "Begin with a simple draft. Capture what matters, clear a little space, and move forward at your own pace.",
    start: "Start writing",
    resume: "Continue my draft",
    secondary: "Make it yours",
    note: "Your draft stays in this browser, ready whenever you return.",
    smallTitle: "Make a little room to begin.",
    smallDescription:
      "You do not need to figure everything out at once. One sentence is a good place to start.",
    first: "Capture an idea",
    firstDescription: "Give a thought a place to take shape.",
    second: "Find your rhythm",
    secondDescription: "Choose a language and appearance that feel comfortable.",
    third: "Come back anytime",
    thirdDescription: "Your draft saves locally, so you can pick up where you left off.",
  },
  workspace: {
    eyebrow: "Your workspace",
    title: "Take the next small step.",
    description:
      "A clear page for whatever comes next. Your writing saves automatically in this browser.",
    name: "Draft title",
    namePlaceholder: "Give your idea a name",
    body: "Ideas and notes",
    bodyPlaceholder: "What is on your mind?",
    empty: "A blank page. Start with your first sentence.",
    saved: "Saved on this device · {{time}}",
    temporary:
      "Your draft is only available on this page because browser storage is unavailable. Copy anything you need before closing.",
    privacy: "Your writing stays in this browser. It is not sent or synced automatically.",
    words: "{{count}} characters",
  },
  settings: {
    unavailable:
      "Preferences could not load. Close this dialog to keep working, then refresh the page later to try again.",
    title: "Preferences",
    description: "Make the space comfortable. Changes save automatically in this browser.",
    language: "Interface language",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "System",
    palette: "Palette",
    indigo: "Dusk",
    moss: "Moss",
    accent: "Accent",
    theme: "Use palette accent",
    clay: "Clay",
    ocean: "Ocean",
    density: "Density",
    comfortable: "Comfortable",
    compact: "Compact",
    reset: "Restore default preferences",
    hint: "Accents highlight choices and small details. Text and primary actions remain easy to read.",
    storageWarning:
      "Your preferences are only available on this page because browser storage could not save the changes.",
    recovered:
      "Your previous preferences could not be read. Default settings are ready for you to adjust.",
  },
  missing: {
    title: "Nothing here just yet.",
    description: "This address is not available. Head home to continue.",
  },
  footer: { local: "Your writing stays in your browser." },
};
