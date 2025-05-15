# QuickNotes Drawing App

A simple web-based drawing app that lets you sketch, draw shapes, write text, and manage multiple canvases. Built with vanilla JavaScript, HTML, and CSS.

---

## Features

- **Freehand Drawing:** Use the pen tool to draw freely.
- **Eraser:** Erase parts of your drawing or clear the canvas.
- **Shapes:** Draw rectangles, circles, and lines.
- **Text Tool:** Add text to your canvas.
- **Color and Size Selection:** Choose brush color and size.
- **Multiple Canvases:** Add new canvases and switch between them.
- **Save:** Export your drawings as JSON data.

---

## Project Structure

- index.html — Main HTML file containing the app layout.
- style.css — Styles for the app interface.
- script.js — All drawing logic and interactivity.

---

## Getting Started

1. **Clone or Download the Repository**
2. **Open index.html in your browser**

No build steps or dependencies required.

---

## Usage

- Use the toolbar to select tools (Pen, Text, Eraser, Shapes, Add Canvas).
- Click the color palette to change brush color.
- Adjust the size slider for brush thickness.
- Click "Save" to export your drawings as JSON in the console.

---

## How Undo/Shape Preview Works

- When drawing shapes, the app takes a snapshot of the canvas before you start.
- As you drag, the canvas is restored to the snapshot and the preview shape is drawn.
- On mouse/touch release, the final shape is committed.

---

## License

MIT License

---

Made with ❤️ for quick sketching and note-taking!
