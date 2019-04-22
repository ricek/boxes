var ct = 0;
var utc = Date.now();
// default place holder image
var img = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
var boxID = 0;

window.onload = function() {
    addElement(img);
    
    // initial box for instruction
    var box0 = document.getElementById("box0");
    var title = document.createElement('h3');
    var list = document.createElement('ul');
    var btn = document.createElement('button');
    array = ["To generate a new box, double-click anywhere. (default plain transparent)","To re-size click on the circle...","To change hue click on image...","Use any pictures and have fun, they are NOT uploaded to anywhere"];
    for (var i = 0; i < array.length; i++) {
        var item = document.createElement('li');
        item.appendChild(document.createTextNode(array[i]));
        list.appendChild(item);
    }
    title.innerHTML = "Welcome to Boxes!";
    box0.style.width = "300px";
    box0.style.padding = "15px";
    
    // download button to capture the page
    btn.innerHTML = "Download";
    btn.addEventListener("click", capture);
    btn.style.marginLeft = "20px";
    title.appendChild(btn);
    
    box0.removeChild(box0.childNodes[0]);
    box0.appendChild(title);
    box0.appendChild(list);
    
    // ignore the initial insturction box from the render
    box0.setAttribute("data-html2canvas-ignore", "true");
}

// generate new box
window.ondblclick = function() {
    addElement();
}

// save the image based64 data to temporarily store for new box
function loadImage(event) {
    var reader = new FileReader();
    reader.onload = function() {
        img = reader.result;
        addElement();
    }
    reader.readAsDataURL(event.target.files[0]);
}

function addElement() {
    var wrapper = document.getElementById("wrapper");
    var newBox = document.createElement("div");
    var newTimestamp = document.createElement("span");
    var newImg = document.createElement("img");
    
    var resizer = document.createElement("div");
    resizer.setAttribute("id", "resizer" + ct);
    resizer.setAttribute("class", "resizer unlock");
    resizer.addEventListener('mousedown', initialiseResize, false);
    // do not render the resizer circle when downloaded
    resizer.setAttribute("data-html2canvas-ignore", "true");
    
    newBox.setAttribute("id", "box" + ct);
    newBox.setAttribute("class", "box");
    newBox.style.zIndex = Math.floor((Date.now() - utc)/100);
    newImg.setAttribute("id", "img" + ct);
    newImg.setAttribute("src", img);
    newImg.style.width = "100%";
    

    newTimestamp.setAttribute("id", "ts" + ct);
    newTimestamp.innerHTML = Date.now();
    
    newBox.appendChild(newImg);
    newBox.appendChild(newTimestamp);
    newBox.appendChild(resizer);
    wrapper.appendChild(newBox);
    
    dragElement(document.getElementById("box" + ct));
    
    ct++;
}

/* https://www.w3schools.com/howto/howto_js_draggable.asp */
function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    
    // whenever the mouse click on the box
    elmnt.onmousedown = dragMouseDown;
    
    var currentTS = elmnt.children[1];
    console.log(currentTS);
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;

        // bring the current box to the front
        elmnt.style.zIndex = Math.floor((Date.now() - utc)/100);

        if (elmnt.children.length > 2){
            var randomDegree = Math.floor((Math.random() * 360) + 1);
            elmnt.children[0].style.filter = "hue-rotate(" + randomDegree + "deg)";
        }
        
        // check to see if dragging or resizing
        if (e.target.id.includes("resizer")) {
            document.onmouseup = stopResizing;
            document.onmousemove = startResizing;
        } else {
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        // elmnt.children[0].style.filter = "grayscale(0%)";
        // update the timestamp
        currentTS.innerHTML = Date.now();
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function initialiseResize(e) {
    boxID = e.target.id.slice(7);
    if (e.target.id.includes("resizer")) {
        document.getElementById(e.target.id).style.borderColor = "green";
    }
	window.addEventListener('mousemove', startResizing, false);
   	window.addEventListener('mouseup', stopResizing, false);
}

function startResizing(e) {
        var box = document.getElementById("box" + boxID);
        box.style.width = (e.clientX - box.offsetLeft) + 'px';
        box.style.height = (e.clientY - box.offsetTop) + 'px';
}

function stopResizing(e) {
    if (e.target.id.includes("resizer")) {
        document.getElementById(e.target.id).style.borderColor = "red";
    };
    document.onmouseup = null;
    document.onmousemove = null;
    window.removeEventListener('mousemove', startResizing, false);
    window.removeEventListener('mouseup', stopResizing, false);
}

/* https://html2canvas.hertzen.com */
/* https://github.com/SuperAL/canvas2image */
function capture(){
    // since capture doesn't support box-shadow css, border will be added when render the page
    var boxes = document.getElementsByClassName("box");
    var skipFirst = true;
    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    var borderColor = prompt("Pick a border color: ", "#" + randomColor);
    for (var box of boxes) {
        // do not touch the instruction box
        if (skipFirst == true) {
            skipFirst = false;
            continue;
        };
        box.style.border = "2px solid " + borderColor;
        // remove all elements except the image so it can no longer be modified
        while (box.children.length > 1){
            box.removeChild(box.childNodes[1]);
        };
    }
    document.body.classList.remove('screenshot');
    document.body.style.backgroundColor = "#" + randomColor;
    html2canvas(document.body).then(function(canvas) {
        // export the canvas to jpg
        return Canvas2Image.saveAsJPEG(canvas);
    }).then(function() {
        // clear out the border color once the render page downloaded
        for (var box of boxes) {
            box.style.border = "";
        }
        document.body.classList.add('screenshot');
        document.body.style.backgroundColor = "";
    })
}
