// Get references to DOM elements
let newcanvas = document.getElementById('canvas');
let ctx = newcanvas.getContext('2d');

// Keep track of all canvases
let canvasarray = [];
canvasarray[0] = newcanvas;

// Set initial drawing parameters
let isDrawing = false;
let drawcolor = "#fff";
let size = 5;
let currentTool = "pen"; // Default tool
let startX, startY; // Starting coordinates for shapes

// Use viewport dimensions but allow for scrolling
const width = window.innerWidth - 30; // Slight padding for better appearance
const height = 150 * window.innerHeight / 100; // 80vh as specified in CSS

let setsize = document.getElementById('size');
setsize.addEventListener('input', function() {
    document.getElementById('rangeview').style.width = setsize.value+"px";
    document.getElementById('rangeview').style.height = setsize.value+"px";
    }
);

// Function to resize canvas
function resizeCanvas(canvas) {
    canvas.width = width;
    canvas.height = height;
    
    // Set default background
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Resize the initial canvas
resizeCanvas(newcanvas);

// Add event listeners for drawing
newcanvas.addEventListener("touchstart", (e) => startDrawing(e, newcanvas), false);
newcanvas.addEventListener("touchmove", (e) => draw(e, newcanvas), false);
newcanvas.addEventListener("mousedown", (e) => startDrawing(e, newcanvas), false);
newcanvas.addEventListener("mousemove", (e) => draw(e, newcanvas), false);
newcanvas.addEventListener("touchend", stopDrawing, false);
newcanvas.addEventListener("mouseup", stopDrawing, false);

let snapshot = null; // For shape preview

function startDrawing(e, targetCanvas) {
    isDrawing = true;
    const rect = targetCanvas.getBoundingClientRect();
    const ctx = targetCanvas.getContext('2d');
    let clientX, clientY;
    if (e.type.includes('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    const x = (clientX - rect.left) * (targetCanvas.width / rect.width);
    const y = (clientY - rect.top) * (targetCanvas.height / rect.height);

    startX = x;
    startY = y;

    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();

    size = document.getElementById('size').value;
    document.getElementById('select_colour').style.visibility = "hidden";
    document.getElementById('shape-select').style.visibility = "hidden";
    targetCanvas.currentContext = ctx;

    // Save snapshot for shapes
    if (currentTool !== "pen" && currentTool !== "eraser") {
        snapshot = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
    }
}

function draw(e, targetCanvas) {
    if (!isDrawing) return;
    const rect = targetCanvas.getBoundingClientRect();
    const ctx = targetCanvas.currentContext || targetCanvas.getContext('2d');
    let clientX, clientY;
    if (e.type.includes('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    const x = (clientX - rect.left) * (targetCanvas.width / rect.width);
    const y = (clientY - rect.top) * (targetCanvas.height / rect.height);

    ctx.lineWidth = size;
    ctx.strokeStyle = drawcolor;
    ctx.globalAlpha = 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "pen") {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    else if (currentTool === "eraser") {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
    }
    // Shape tools: restore snapshot, then draw preview
    else if (["rectangle", "circle", "line", "text"].includes(currentTool)) {
        if (snapshot) ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = drawcolor;
        ctx.fillStyle = drawcolor;
        if (currentTool === "rectangle") {
            ctx.strokeRect(startX, startY, x - startX, y - startY);
        } else if (currentTool === "circle") {
            ctx.beginPath();
            let radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (currentTool === "line") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (currentTool === "text") {
            ctx.font = `${size}px Arial`;
            ctx.fillText("Your Text Here", x, y);
        }
    }
    e.preventDefault();
}

function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    // For shape tools, commit the final shape
    if (["rectangle", "circle", "line", "text"].includes(currentTool)) {
        // Simulate a final draw at the last position
        draw(e, e.target);
        snapshot = null;
    }
    e.preventDefault();
}

function change_colour(element) {
    drawcolor = element.style.backgroundColor;
}

function colour_change(element) {
    drawcolor = element.value;
}

// Setup toolbar functionality
let penbtn = document.getElementById('pen');
penbtn.addEventListener('click', function() {
    let w = document.getElementById('select_colour');
    w.style.visibility = "visible";
    w.style.opacity = "1";
    currentTool = "pen";
});
document.getElementById('shapes').addEventListener('click', function() {
    let w = document.getElementById('shape-select');
    w.style.visibility = "visible";
    w.style.opacity = "1";
    currentTool = "rectangle"; // Default to rectangle
}
);

function shape_select(element) {
    let w = document.getElementById('shape-select');
    w.style.visibility = "hidden";
    w.style.opacity = "0";
    currentTool = element.id; // Set the current tool to the selected shape
}

document.getElementById('save').addEventListener('click', function() {
    //function to convert whole canvasarray in json
    let canvasData = canvasarray.map(canvas => {
        return {
            width: canvas.width,
            height: canvas.height,
            data: canvas.toDataURL()
        };
    });
    let jsonData = JSON.stringify(canvasData);
    console.log(jsonData);
    // let blob = new Blob([jsonData], { type: "application/json" });
    // let url = URL.createObjectURL(blob);
});


document.getElementById('eraser').addEventListener('click', function() {
    const activeCanvas = canvasarray[canvasarray.length - 1];
    const ctx = activeCanvas.getContext('2d');
    ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    document.getElementById('select_colour').style.visibility = "hidden";
});

// Add new canvas functionality
document.getElementById('addcanvas').addEventListener('click', function() {
    let newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('class', 'canvases'); // Set class for the new canvas
    
    // Set up the canvas
    resizeCanvas(newCanvas);
    
    canvasarray.push(newCanvas); // Add the new canvas to the canvas array
    document.getElementById('canvas-area').appendChild(newCanvas); // Append the new canvas to the drawing area
    
    // Scroll to the new canvas
    newCanvas.scrollIntoView({ behavior: 'smooth' });

    // Add event listeners for the new canvas
    newCanvas.addEventListener("mousedown", (e) => startDrawing(e, newCanvas));
    newCanvas.addEventListener("mousemove", (e) => draw(e, newCanvas));
    newCanvas.addEventListener("mouseup", stopDrawing);
    newCanvas.addEventListener("touchstart", (e) => startDrawing(e, newCanvas));
    newCanvas.addEventListener("touchmove", (e) => draw(e, newCanvas));
    newCanvas.addEventListener("touchend", stopDrawing);
});