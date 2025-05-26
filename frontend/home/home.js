document.addEventListener("DOMContentLoaded", function () {
    let noteCanvasMap = {}; // key: noteId, value: array of canvases
    let currentNoteId = null;
    let currentPageIndex = 0;
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const DEFAULT_CANVAS_WIDTH = 900;
    const DEFAULT_CANVAS_HEIGHT = 1500;

    function getUsernameFromToken(token) {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // atob decodes base64 to a string 
            return payload.username || null;
        } catch (e) {
            console.error("Invalid token format:", e);
            return null;
        }
    }
    const username = getUsernameFromToken(token);
    const userSpan = document.getElementById("user");
    if (userSpan && username) {
        userSpan.innerText = username;
    }

    const fullscreenBtn = document.getElementById("fullscreen");
    const navbar = document.getElementById("navbar");
    const sideview = document.getElementById("sideview");
    const notnav = document.getElementById("notnav");
    const drawarea = document.getElementById("drawarea");
    const canvasarea = document.getElementById("canvasarea");

    // No default canvas on load
    let canvas = null;
    let ctx = null;

    // Drawing state variables
    let penwidth = document.getElementById("penwidth");
    let penview = document.getElementById("penview");
    let pencolor = "white";
    let isdrawing = false;

    // Shape drawing variables
    let shapeStart = null;
    let shapeEnd = null;
    let isDrawingShape = false;
    let currentShape = "rectangle";
    let shapePreview = null;

    // Highlighter variables
    let highlighterColor = "rgba(255,255,0,0.4)";
    let highlighterWidth = 24;

    // Tool state
    let currentTool = "pen";
    let isFullscreen = false;

    // --- TOOL SELECTORS ---
    document.getElementById("pen").addEventListener("click", () => {
        currentTool = "pen";
        hideAllToolDivs();
        toggleToolDiv("pensetter");
    });

    document.getElementById("Eraser").addEventListener("click", () => {
        currentTool = "eraser";
        hideAllToolDivs();
    });

    document.getElementById("Highlighter").addEventListener("click", () => {
        currentTool = "highlighter";
        hideAllToolDivs();
        toggleToolDiv("Highlightersetter");
    });

    document.getElementById("Shapes").addEventListener("click", () => {
        currentTool = "shape";
        hideAllToolDivs();
        toggleToolDiv("shapesetter");
    });

    function hideAllToolDivs() {
        const toolDivs = document.getElementsByClassName("toolsdiv");
        for (let i = 0; i < toolDivs.length; i++) {
            toolDivs[i].style.display = "none";
        }
    }
    function toggleToolDiv(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = (el.style.display !== "flex") ? "flex" : "none";
    }

    // --- COLOR PICKER HANDLER ---
    window.changecolor = (element) => {
        if (currentTool === "highlighter") {
            const computedStyle = window.getComputedStyle(element);
            highlighterColor = computedStyle.backgroundColor;
        } else {
            pencolor = element.style.backgroundColor;
        }
    };

    // --- PEN WIDTH PREVIEW ---
    penwidth.addEventListener("input", () => {
        const size = penwidth.value + "px";
        penview.style.width = size;
        penview.style.height = size;
    });
    penview.style.width = penwidth.value + "px";
    penview.style.height = penwidth.value + "px";

    // --- FULLSCREEN HANDLER ---
    fullscreenBtn.addEventListener("click", () => {
        if (!canvas) return;
        isFullscreen = !isFullscreen;

        if (isFullscreen) {
            navbar.style.display = "none";
            sideview.style.display = "none";
            drawarea.style.width = "100%";
            drawarea.style.margin = "0";
            drawarea.style.borderRadius = "0";
            drawarea.style.height = "100vh";
            notnav.style.height = "100vh";
            drawarea.requestFullscreen().catch(err => {
                console.error("Fullscreen error:", err);
            });
            fullscreenBtn.innerText = "🗗";
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            navbar.style.display = "flex";
            sideview.style.display = "block";
            drawarea.style.width = "80%";
            drawarea.style.margin = "12px";
            drawarea.style.borderRadius = "25px";
            drawarea.style.height = "";
            notnav.style.height = "calc(100vh - 120px)";
            fullscreenBtn.innerText = "⛶";
        }
    });

    // --- CANVAS SELECTION HANDLER ---
    canvasarea.addEventListener("click", function(e) {
        if (e.target.tagName === "CANVAS") {
            const clickedCanvas = e.target;
            const clickedCtx = clickedCanvas.getContext("2d");
            document.querySelectorAll(".canvases").forEach(c => c.style.border = "");
            clickedCanvas.style.border = "2px solid yellow";
            canvas = clickedCanvas;
            ctx = clickedCtx;
        }
    });

    // --- DRAWING LOGIC (WORKS FOR ANY CANVAS) ---
    function getCanvasPos(e, targetCanvas) {
        const rect = targetCanvas.getBoundingClientRect();
        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        return { x, y };
    }

    function start(e) {
        const targetCanvas = e.target;
        const targetCtx = targetCanvas.getContext("2d");
        const pos = getCanvasPos(e, targetCanvas);

        hideAllToolDivs();

        if (currentTool === "shape") {
            isDrawingShape = true;
            shapeStart = pos;
            shapePreview = targetCtx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
        } else {
            isdrawing = true;
            targetCtx.beginPath();
            targetCtx.moveTo(pos.x, pos.y);
        }
        targetCanvas._drawing = { ctx: targetCtx, startPos: pos };
        e.preventDefault();
    }

    function draw(e) {
        const targetCanvas = e.target;
        const drawing = targetCanvas._drawing;
        if (!drawing) return;
        const targetCtx = drawing.ctx;
        const pos = getCanvasPos(e, targetCanvas);

        if (isDrawingShape && shapeStart) {
            shapeEnd = pos;
            if (shapePreview) {
                targetCtx.putImageData(shapePreview, 0, 0);
            }
            previewShape(targetCtx, shapeStart, shapeEnd, currentShape);
        } else if (isdrawing) {
            targetCtx.lineTo(pos.x, pos.y);

            if (currentTool === "eraser") {
                targetCtx.strokeStyle = "black";
                targetCtx.lineWidth = penwidth.value || 2;
            } else if (currentTool === "highlighter") {
                targetCtx.strokeStyle = highlighterColor;
                targetCtx.lineWidth = highlighterWidth;
                targetCtx.globalAlpha = 0.3;
            } else {
                targetCtx.strokeStyle = pencolor;
                targetCtx.lineWidth = penwidth.value || 2;
            }

            targetCtx.lineCap = "round";
            targetCtx.lineJoin = "round";
            targetCtx.stroke();

            if (currentTool === "highlighter") {
                targetCtx.beginPath();
                targetCtx.moveTo(pos.x, pos.y);
            }
        }
    }

    function stop(e) {
        const targetCanvas = e.target;
        const drawing = targetCanvas._drawing;
        if (!drawing) return;
        const targetCtx = drawing.ctx;

        if (isDrawingShape && shapeStart && shapeEnd) {
            drawFinalShape(targetCtx, shapeStart, shapeEnd, currentShape);
            isDrawingShape = false;
            shapeStart = null;
            shapeEnd = null;
            shapePreview = null;
        } else if (isdrawing) {
            targetCtx.stroke();
            targetCtx.closePath();
            isdrawing = false;
            if (currentTool === "highlighter") {
                targetCtx.globalAlpha = 1.0;
            }
        }
        delete targetCanvas._drawing;
        e.preventDefault();
    }

    function previewShape(ctx, start, end, shape) {
        ctx.strokeStyle = pencolor;
        ctx.lineWidth = penwidth.value || 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (shape === "rectangle") {
            ctx.beginPath();
            ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
            ctx.stroke();
        } else if (shape === "circle") {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape === "line") {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    function drawFinalShape(ctx, start, end, shape) {
        ctx.strokeStyle = pencolor;
        ctx.lineWidth = penwidth.value || 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (shape === "rectangle") {
            ctx.beginPath();
            ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
            ctx.stroke();
        } else if (shape === "circle") {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape === "line") {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    // --- EVENT LISTENERS FOR CANVAS ---
    function addDrawingListeners(targetCanvas) {
        targetCanvas.addEventListener("touchstart", start, false);
        targetCanvas.addEventListener("touchmove", draw, false);
        targetCanvas.addEventListener("mousedown", start, false);
        targetCanvas.addEventListener("mousemove", draw, false);
        targetCanvas.addEventListener("touchend", stop, false);
        targetCanvas.addEventListener("mouseup", stop, false);
        targetCanvas.addEventListener("mouseout", stop, false);
    }

    // --- ADD PAGE FUNCTIONALITY ---
    document.getElementById("addPage").addEventListener("click", () => {
    if (!currentNoteId) return; // No note selected

    // Create a new canvas for the new page
    const newCanvas = document.createElement("canvas");
    newCanvas.className = "canvases";
    newCanvas.width = DEFAULT_CANVAS_WIDTH;
    newCanvas.height = DEFAULT_CANVAS_HEIGHT;
    addDrawingListeners(newCanvas);

    // Add to the current note's canvas array
    noteCanvasMap[currentNoteId].push(newCanvas);

    // Refresh the view to show all canvases for this note
    noteclicked(document.querySelector(`[data-note-id="${currentNoteId}"]`));
    newCanvas.scrollIntoView({ behavior: "smooth" });
});

    // --- SHAPE SETTINGS PANEL CREATION ---
    if (!document.getElementById("shapesetter")) {
        const shapesetter = document.createElement("div");
        shapesetter.id = "shapesetter";
        shapesetter.className = "toolsdiv";
        shapesetter.style.display = "none";
        shapesetter.style.position = "absolute";
        shapesetter.style.top = "260px";
        shapesetter.style.right = "80px";
        shapesetter.style.backgroundColor = "#000000";
        shapesetter.style.borderRadius = "20px";
        shapesetter.style.height = "150px";
        shapesetter.style.width = "300px";
        shapesetter.style.border = "1px solid rgba(255, 255, 255, 0.5)";
        shapesetter.style.padding = "20px";
        shapesetter.style.flexDirection = "column";
        shapesetter.style.zIndex = "10";
        shapesetter.innerHTML = `
            <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
                <button id="shape-rectangle" class="shape-btn" style="width: 80px; height: 40px; border: 1px solid rgba(255, 255, 255, 0.5); background-color: black; color: white; border-radius: 5px;">Rectangle</button>
                <button id="shape-circle" class="shape-btn" style="width: 80px; height: 40px; border: 1px solid rgba(255, 255, 255, 0.5); background-color: black; color: white; border-radius: 5px;">Circle</button>
                <button id="shape-line" class="shape-btn" style="width: 80px; height: 40px; border: 1px solid rgba(255, 255, 255, 0.5); background-color: black; color: white; border-radius: 5px;">Line</button>
            </div>
            <div id="shape-colou-field" style="height: 50%; width: 100%; display: flex; flex-direction: row; justify-content: center;">
                <div onclick="changecolor(this)" class="colour-selection" style="background-color: red;"></div>
                <div onclick="changecolor(this)" class="colour-selection" style="background-color: orange;"></div>
                <div onclick="changecolor(this)" class="colour-selection" style="background-color: yellow;"></div>
                <div onclick="changecolor(this)" class="colour-selection" style="background-color: green;"></div>
                <div onclick="changecolor(this)" class="colour-selection" style="background-color: blue"></div>
                <div onclick="changecolor(this)" class="colour-selection" style="background-color: violet"></div>
                <div onclick="changecolor(this)" class="colour-selection" style="background-color: white;"></div>
            </div>
        `;
        document.getElementById("drawcontent").appendChild(shapesetter);
        document.getElementById("shape-rectangle").addEventListener("click", () => {
            currentShape = "rectangle";
        });
        document.getElementById("shape-circle").addEventListener("click", () => {
            currentShape = "circle";
        });
        document.getElementById("shape-line").addEventListener("click", () => {
            currentShape = "line";
        });
    }

    // --- WINDOW RESIZE HANDLER ---
    window.addEventListener("resize", () => {
        // No canvas resizing to keep all canvases the same size
    });

    document.getElementById("addnote").addEventListener("click",()=>{
        if(document.getElementById("addnotewindow").style.display === "flex"){
            document.getElementById("addnotewindow").style.display = "none"
        }
        else{
            document.getElementById("addnotewindow").style.display = "flex"
        }
    });

    document.getElementById("submitnotetitle").addEventListener("click", () => {
        let notetitle = document.getElementById("notetitle").value.trim();
        if (!notetitle) return;
        document.getElementById("notetitle").value = "";

        // Create note div
        const noteDiv = document.createElement("div");
        noteDiv.className = "notes";
        
        // Create title span for clean text separation
        const titleSpan = document.createElement("span");
        titleSpan.className = "note-title";
        titleSpan.innerText = notetitle;
        noteDiv.appendChild(titleSpan);
        
        noteDiv.dataset.title = notetitle;

        // Give each note a unique id (could use timestamp or increment)
        const noteId = "note_" + Date.now();
        noteDiv.dataset.noteId = noteId;

        // Create and append the delete button
        let notedelbtn = document.createElement("button");
        notedelbtn.className = "notedelbtn";
        notedelbtn.innerText = "🗑️";
        notedelbtn.onclick = deleteNote;
        noteDiv.appendChild(notedelbtn);

        // Create first canvas for this note
        const noteCanvas = document.createElement("canvas");
        noteCanvas.className = "canvases";
        noteCanvas.width = DEFAULT_CANVAS_WIDTH;
        noteCanvas.height = DEFAULT_CANVAS_HEIGHT;
        addDrawingListeners(noteCanvas);

        // Store as array
        noteCanvasMap[noteId] = [noteCanvas];

        // Note click logic
        noteDiv.onclick = function(e) {
            // Prevent note selection if the delete button was clicked
            if (e.target.classList.contains("notedelbtn")) return;
            noteclicked(this);
        };

        document.getElementById("notearea").appendChild(noteDiv);

        // Auto-select the new note
        noteclicked(noteDiv);
    });

    function noteclicked(element) {
        // Highlight selected note
        let notes = document.getElementsByClassName("notes");
        for (let i = 0; i < notes.length; i++) {
            notes[i].style.backgroundColor = "black";
            notes[i].style.color = "white";
        }
        element.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        element.style.color = "black";
        
        // Use the title from dataset or find the title span
        const titleSpan = element.querySelector('.note-title');
        const noteTitle = titleSpan ? titleSpan.innerText : element.dataset.title;
        document.getElementById("notename").innerText = noteTitle || "Untitled";

        // Remove all canvases from canvasarea
        while (canvasarea.firstChild) {
            canvasarea.removeChild(canvasarea.firstChild);
        }

        // Show all canvases for the selected note
        const noteId = element.dataset.noteId;
        currentNoteId = noteId;
        currentPageIndex = 0;
        const canvases = noteCanvasMap[noteId];
        canvases.forEach((c, idx) => {
            canvasarea.appendChild(c);
            addDrawingListeners(c); // Ensure listeners are attached
        });

        // Set canvas/ctx to the first page for tool logic
        canvas = canvases[0];
        ctx = canvas.getContext("2d");
    }

// --- Save Notes ---
document.getElementById("save").addEventListener("click", async () => {
    document.getElementById("save").innerText = "Saving...";

    // Get the note titles from the DOM
    const noteTitles = {};
    const noteElements = document.getElementsByClassName("notes");
    for (let i = 0; i < noteElements.length; i++) {
        const noteId = noteElements[i].dataset.noteId;
        const titleSpan = noteElements[i].querySelector('.note-title');
        noteTitles[noteId] = titleSpan ? titleSpan.innerText : noteElements[i].dataset.title;
    }
    
    // Structure the data correctly for the backend
    const notesToSave = [];
    for (const [noteId, canvases] of Object.entries(noteCanvasMap)) {
        notesToSave.push({
            id: noteId,
            title: noteTitles[noteId],
            pages: canvases.map(canvas => canvas.toDataURL())
        });
    }
    
    try {
        const origin = window.location.origin;
        const response = await fetch(`${origin}/updatefolder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ 
                notes: notesToSave
            })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            alert("Notes saved successfully!");
        } else {
            alert(`Failed to save notes: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {   
        console.error("Error saving notes:", error);
        alert(`Error saving notes: ${error.message}`);
    }

    document.getElementById("save").innerText = "Save";
});

function deleteNote() {
    const noteDiv = this.parentElement;
    const noteId = noteDiv.dataset.noteId;
    // Remove from DOM
    noteDiv.style.display = "none";
    // Remove from noteCanvasMap
    delete noteCanvasMap[noteId];
}

// --- Load Notes ---
async function loadUserNotes() {
    try {
        console.log("JWT token:", token);
        const origin = window.location.origin;
        const response = await fetch(`${origin}/getfolder`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        // data.notes should be an array of { id, title, pages }
        if (!data.notes) return;

        console.log("Rendering notes:", data.notes);
        data.notes.forEach(note => {
            console.log("Rendering note:", note.title, note.pages.length, "pages");
            // Create note div
            const noteDiv = document.createElement("div");
            noteDiv.className = "notes";
            
            // Create title span for clean text separation
            const titleSpan = document.createElement("span");
            titleSpan.className = "note-title";
            titleSpan.innerText = note.title;
            noteDiv.appendChild(titleSpan);
            
            noteDiv.dataset.title = note.title;
            noteDiv.dataset.noteId = note.id;

            // Create and append the delete button
            let notedelbtn= document.createElement("button");
            notedelbtn.className = "notedelbtn";
            notedelbtn.innerText = "🗑️";
            notedelbtn.onclick = deleteNote;
            noteDiv.appendChild(notedelbtn);

            // Restore canvases for this note
            const canvases = [];
            note.pages.forEach(pageDataUrl => {
                const canvas = document.createElement("canvas");
                canvas.className = "canvases";
                canvas.width = DEFAULT_CANVAS_WIDTH;
                canvas.height = DEFAULT_CANVAS_HEIGHT;
                addDrawingListeners(canvas);
                const ctx = canvas.getContext("2d");
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = pageDataUrl;
                canvases.push(canvas);
            });
            noteCanvasMap[note.id] = canvases;

            // Note click logic
            noteDiv.onclick = function(e) {
                // Prevent note selection if the delete button was clicked
                if (e.target.classList.contains("notedelbtn")) return;
                noteclicked(this);
            };

            document.getElementById("notearea").appendChild(noteDiv);
        });

        // Auto-select the first note if any
        const firstNoteDiv = document.querySelector("#notearea .notes");
        if (firstNoteDiv) noteclicked(firstNoteDiv);

    } catch (error) {
        console.error("Error loading notes:", error);
        alert(`Error loading notes: ${error.message}`);
    }
}
loadUserNotes();
});