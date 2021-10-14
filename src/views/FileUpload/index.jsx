import React, { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone";
import Slide from "@material-ui/core/Slide";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { makeStyles } from "@material-ui/core/styles";

import styles from "../../assets/jss/material-dashboard-pro-react/modalStyle.js";
import { Button } from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import Draggable, { DraggableCore } from 'react-draggable'; // Both at the same time

const useStyles = makeStyles(styles);



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});


var texts = [];
var painting = false;
var selectedText = -1;
var offsetX, offsetY;
var startX, startY;
var mouseX, mouseY;
var canvas, context;
const win = {
  w: window.innerWidth,
  h: window.innerHeight,
}

var lastX, lastY = 0;


function MyDropzone() {

  const maxLength = 20;
  const classes = useStyles();

  // an array to hold text objects

  // this var will hold the index of the hit-selected text

  const nameLengthValidator = (file) => {
    console.log('nameLengthValidator file =>', file);
    if (file.name.length > maxLength) {
      return {
        code: "name-too-large",
        message: `Name is larger than ${maxLength} characters`
      };
    }

    return null
  }

  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState()
  const [modal, setModal] = useState(false);
  const [toolMode, setToolMode] = useState("pen");
  const [value, setValue] = useState("");
  // const [painting, setPainting] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    preview
    console.log('acceptedFiles[0] =>', acceptedFiles[0]);
    const objectUrl = URL.createObjectURL(acceptedFiles[0])
    setPreview(objectUrl)
    // Do something with the files
    setSelectedFile(acceptedFiles[0])
    texts = []

    var canvas = document.getElementById("canvas"); // grabs the canvas element
    var context = canvas.getContext("2d"); // returns the 2d context object

    setModal(true)

    let base_image = new Image();
    base_image.src = objectUrl;
    base_image.onload = function () {
      // context.drawImage(base_image, 0, 0);
      coverImg(base_image)
    }


  }, [])


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // validator: nameLengthValidator
  })


  const addText = () => {

    // calc the y coordinate for this text on the canvas
    var y = texts.length * 20 + 20;

    // get the text from the input element
    var text = {
      text: value,
      x: 20,
      y: y
    };

    canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");

    // calc the size of this text for hit-testing purposes
    context.font = "80px consolas";
    text.width = context.measureText(text.text).width;
    text.height = 80;

    // put this new text in the texts array
    texts.push(text);

    // redraw everything
    draw();

  }

  /*--------------------
Cover Image
--------------------*/
  const coverImg = (img, type = 'cover') => {
    canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");
    console.log('img.height =>', img.height);
    const imgRatio = img.height / img.width
    const winRatio = window.innerHeight / window.innerWidth
    console.log('winRatio =>', winRatio);
    if ((imgRatio < winRatio && type === 'contain') || (imgRatio > winRatio && type === 'cover')) {
      const h = window.innerWidth * imgRatio
      context.drawImage(img, 0, (window.innerHeight - h) / 2, window.innerWidth, h)
    }
    if ((imgRatio > winRatio && type === 'contain') || (imgRatio < winRatio && type === 'cover')) {
      const w = window.innerWidth * winRatio / imgRatio
      context.drawImage(img, (win.w - w) / 2, 0, w, window.innerHeight)
    }
  }


  // clear the canvas & redraw all texts
  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");

    let base_image = new Image();
    base_image.src = preview;
    // context.drawImage(base_image, 0, 0);
    coverImg(base_image)
    // base_image.onload = function () {
    // }


    for (var i = 0; i < texts.length; i++) {
      var text = texts[i];
      context.fillText(text.text, text.x, text.y);
    }
  }

  // clear the canvas
  const clearAll = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");


    texts = []
    selectedText = -1

    let base_image = new Image();
    base_image.src = preview;
    // context.drawImage(base_image, 0, 0);
    coverImg(base_image)
    // base_image.onload = function () {
    // }
  }


  // test if x,y is inside the bounding box of texts[textIndex]
  const textHittest = (x, y, textIndex) => {
    var text = texts[textIndex];
    return (x >= text.x && x <= text.x + text.width && y >= text.y - text.height && y <= text.y);
  }

  // handle mousedown events
  // iterate through texts[] and see if the user
  // mousedown'ed on one of them
  // If yes, set the selectedText to the index of that text
  const handleMouseDown = (e) => {
    e.preventDefault();
    startX = parseInt(e.pageX - offsetX);
    startY = parseInt(e.pageY - offsetY);
    console.log('texts =>', texts);
    // Put your mousedown stuff here
    for (var i = 0; i < texts.length; i++) {
      if (textHittest(startX, startY, i)) {
        selectedText = i;
        painting = false
      }
    }
  }

  // done dragging
  const handleMouseUp = (e) => {
    e.preventDefault();
    selectedText = -1;
  }

  // also done dragging
  const handleMouseOut = (e) => {
    e.preventDefault();
    selectedText = -1;
  }

  // handle mousemove events
  // calc how far the mouse has been dragged since
  // the last mousemove event and move the selected text
  // by that distance
  const handleMouseMove = (e) => {
    if (selectedText < 0) {
      return;
    }
    e.preventDefault();
    mouseX = parseInt(e.pageX - offsetX);
    mouseY = parseInt(e.pageY - offsetY);

    // Put your mousemove stuff here
    var dx = mouseX - startX;
    var dy = mouseY - startY;
    startX = mouseX;
    startY = mouseY;

    var text = texts[selectedText];
    text.x += dx;
    text.y += dy;
    draw();
  }

  useEffect(() => {
    if (!document.getElementById("canvas")) return;
    var offsets = document.getElementById('canvas').getBoundingClientRect();
    offsetX = offsets.x
    offsetY = offsets.y
    var canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d"),
      // painting = false,
      lastX = 0,
      lastY = 0,
      lineThickness = 1;
    canvas.height = 400;
    canvas.width = 700;

    context.fillRect(0, 0, 500, 500);




    // canvas.onmousedown = function (e) {
    //   console.log('this.offsetLeft this=>', this);
    //   console.log('this.offsetLeft =>', this.offsetLeft);
    //   painting = true;
    //   context.fillStyle = "red";

    //   lastX = e.pageX - this.offsetLeft - offsetX;
    //   lastY = e.pageY - this.offsetTop - offsetY;
    //   console.log('onmousedown lastX =>', lastX);
    //   console.log('onmousedown lastY =>', lastY);
    // };

    // canvas.onmouseup = function (e) {
    //   painting = false;
    // }

    // canvas.onmousemove = function (e) {
    //   if (painting) {

    //     var mouseX = e.pageX - this.offsetLeft - offsetX;
    //     var mouseY = e.pageY - this.offsetTop - offsetY;

    //     console.log('mouseX =>', mouseX);
    //     console.log('mouseY =>', mouseY);

    //     // find all points between        
    //     var x1 = mouseX,
    //       x2 = lastX,
    //       y1 = mouseY,
    //       y2 = lastY;


    //     var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
    //     if (steep) {
    //       var x = x1;
    //       x1 = y1;
    //       y1 = x;

    //       var y = y2;
    //       y2 = x2;
    //       x2 = y;
    //     }
    //     if (x1 > x2) {
    //       var x = x1;
    //       x1 = x2;
    //       x2 = x;

    //       var y = y1;
    //       y1 = y2;
    //       y2 = y;
    //     }

    //     var dx = x2 - x1,
    //       dy = Math.abs(y2 - y1),
    //       error = 0,
    //       de = dy / dx,
    //       yStep = -1,
    //       y = y1;

    //     if (y1 < y2) {
    //       yStep = 1;
    //     }

    //     lineThickness = 5 - Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 10;
    //     if (lineThickness < 1) {
    //       lineThickness = 1;
    //     }

    //     for (var x = x1; x < x2; x++) {
    //       if (steep) {
    //         context.fillRect(y, x, lineThickness, lineThickness);
    //       } else {
    //         context.fillRect(x, y, lineThickness, lineThickness);
    //       }

    //       error += de;
    //       if (error >= 0.5) {
    //         y += yStep;
    //         error -= 1.0;
    //       }
    //     }

    //     lastX = mouseX;
    //     lastY = mouseY;

    //   }
    // }

    // listen for mouse events
    canvas.onmousedown = (function (e) {
      painting = true;
      handleMouseDown(e);
      console.log('this.offsetLeft this=>', this);
      console.log('this.offsetLeft =>', this.offsetLeft);
      // setPainting(true)
      // context.fillStyle = "red";

      lastX = e.pageX - this.offsetLeft - offsetX;
      lastY = e.pageY - this.offsetTop - offsetY;
      console.log('onmousedown lastX =>', lastX);
      console.log('onmousedown lastY =>', lastY);
    });

    canvas.onmousemove = (function (e) {
      handleMouseMove(e);
      console.log('painting =>', painting);
      if (painting) {

        var mouseX = e.pageX - this.offsetLeft - offsetX;
        var mouseY = e.pageY - this.offsetTop - offsetY;

        console.log('mouseX =>', mouseX);
        console.log('mouseY =>', mouseY);

        // find all points between        
        var x1 = mouseX,
          x2 = lastX,
          y1 = mouseY,
          y2 = lastY;


        var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
        if (steep) {
          var x = x1;
          x1 = y1;
          y1 = x;

          var y = y2;
          y2 = x2;
          x2 = y;
        }
        if (x1 > x2) {
          var x = x1;
          x1 = x2;
          x2 = x;

          var y = y1;
          y1 = y2;
          y2 = y;
        }

        var dx = x2 - x1,
          dy = Math.abs(y2 - y1),
          error = 0,
          de = dy / dx,
          yStep = -1,
          y = y1;

        if (y1 < y2) {
          yStep = 1;
        }

        lineThickness = 5 - Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 10;
        if (lineThickness < 1) {
          lineThickness = 1;
        }

        for (var x = x1; x < x2; x++) {
          if (steep) {
            context.fillRect(y, x, lineThickness, lineThickness);
          } else {
            context.fillRect(x, y, lineThickness, lineThickness);
          }

          error += de;
          if (error >= 0.5) {
            y += yStep;
            error -= 1.0;
          }
        }

        lastX = mouseX;
        lastY = mouseY;

      }
    });

    canvas.onmouseup = (function (e) {
      handleMouseUp(e);
      painting = false;
      // setPainting(false)
    });

    canvas.onmouseout = (function (e) {
      handleMouseOut(e);
    });

  }, [modal])


  const updateImageHandler = () => {
    var canvas = document.getElementById("canvas");
    var dataURL = canvas.toDataURL("image/png");
    console.log('dataURL =>', dataURL);
    setPreview(dataURL)
    setModal(false)
  }
  console.log('dashboard painting =>', painting);


  const undo = () => {
    texts.pop()
    draw();
  }

  const setPainting = () => {
    painting = true;
    lastX = 0
    lastY = 0

  }
  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
      {selectedFile &&
        <div style={{ backgroundImage: `url(${preview})` }} className="custom-file-preview" />
      }



    </div>
  )
}


export default MyDropzone;