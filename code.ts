// This plugin allows you to add colourful sticky notes to your Figma design canvas.

figma.showUI(__html__, { width: 320, height: 400, themeColors: true });

figma.ui.onmessage = async (msg: {
  type: string;
  color?: string;
  text?: string;
  height?: number;
}) => {
  if (msg.type === "resize") {
    figma.ui.resize(320, msg.height || 400);
  } else if (msg.type === "create-sticky-note") {
    console.log("Received create-sticky-note message:", msg);

    await createStickyNote(
      msg.color || "1,1,1",
      msg.text || "Click to edit this note...",
      figma.currentUser?.name || "Anonymous"
    );
    console.log("Sticky note created");
  }
};

let _lastCreatedNote: SceneNode | null = null;

console.log("Figgy Sticks is Figging!(It's starting up)");

figma.ui.postMessage({
  type: "set-username",
  username: figma.currentUser?.name || "Anonymous",
});

async function createStickyNote(
  colorString: string,
  noteText: string,
  authorName: string
) {
  console.log("Creating sticky note with:", {
    colorString,
    noteText,
    authorName,
  });

  try {
    console.log("Loading fonts...");
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      console.log("Fonts loaded successfully");
    } catch (fontError) {
      console.error("Error loading fonts:", fontError);
      await figma.loadFontAsync({ family: "Arial", style: "Regular" });
      console.log("Fallback to Arial font");
    }

    const [r, g, b] = colorString.split(",").map(Number);

    console.log("Creating frame...");
    const stickyNote = figma.createFrame();
    stickyNote.name = "Sticky Note";
    stickyNote.resize(240, 240);
    stickyNote.cornerRadius = 4;
    stickyNote.fills = [{ type: "SOLID", color: { r, g, b } }];
    stickyNote.strokes = [
      { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.1 },
    ];
    stickyNote.strokeWeight = 1;

    stickyNote.x = 100;
    stickyNote.y = 100;
    console.log("Created frame at:", stickyNote.x, stickyNote.y);

    console.log("Creating text node...");
    const textNode = figma.createText();
    textNode.name = "Note Content";
    textNode.fontSize = 14;
    textNode.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    textNode.x = 16;
    textNode.y = 16;
    textNode.resize(208, 180);
    textNode.textAutoResize = "HEIGHT";
    textNode.characters = noteText || "Click to edit this note...";
    console.log("Text node created with content:", textNode.characters);

    console.log("Creating author text node...");
    const userNameText = figma.createText();
    userNameText.name = "User Name";
    userNameText.fontSize = 12;
    userNameText.fontName = { family: "Inter", style: "Medium" };
    userNameText.fills = [
      { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.5 },
    ];
    userNameText.x = 16;
    userNameText.y = 208;
    userNameText.characters = authorName;
    console.log(
      "Author text node created with content:",
      userNameText.characters
    );

    console.log("Adding text nodes to frame...");
    stickyNote.appendChild(textNode);
    stickyNote.appendChild(userNameText);

    figma.currentPage.appendChild(stickyNote);
    console.log("Added frame to current page");

    _lastCreatedNote = stickyNote;

    figma.currentPage.selection = [stickyNote];

    figma.viewport.scrollAndZoomIntoView([stickyNote]);
    console.log("Scrolled viewport to sticky note");

    figma.ui.postMessage({ type: "note-created", success: true });

    return true;
  } catch (error) {
    console.error("Error creating sticky note:", error);
    figma.ui.postMessage({
      type: "note-created",
      success: false,
      error: String(error),
    });
    return false;
  }
}
