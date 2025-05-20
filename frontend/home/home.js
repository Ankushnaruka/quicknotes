document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const DEFAULT_CANVAS_WIDTH = 900;  // or any fixed width you want
const DEFAULT_CANVAS_HEIGHT = 1500;

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
    let canvasData;
    let canvasarray = [];

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
    const newCanvas = document.createElement("canvas");
    newCanvas.className = "canvases";
    newCanvas.width = DEFAULT_CANVAS_WIDTH;
    newCanvas.height = DEFAULT_CANVAS_HEIGHT;
    canvasarea.appendChild(newCanvas);
    addDrawingListeners(newCanvas);
    canvasarray.push(newCanvas);
    document.querySelectorAll(".canvases").forEach(c => c.style.border = "");
    newCanvas.style.border = "2px solid yellow";
    canvas = newCanvas;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
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
        if (!canvas) return;
        if (!isFullscreen) {
            const tempData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = canvasarea.clientWidth - 40;
            ctx.putImageData(tempData, 0, 0);
        } else {
            const tempData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = drawarea.clientWidth - 20;
            canvas.height = drawarea.clientHeight - 20;
            ctx.putImageData(tempData, 0, 0);
        }
    });
});