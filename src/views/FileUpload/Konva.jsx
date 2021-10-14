import React, { useCallback, useRef, useState } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import { useDropzone } from "react-dropzone";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { makeStyles } from "@material-ui/core/styles";
import styles from "../../assets/jss/material-dashboard-pro-react/modalStyle.js";
import Slide from "@material-ui/core/Slide";
import { Button } from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import html2canvas from 'html2canvas';
import { FILE_NAME_MAX_LENGTH } from 'shared/constants.js';
import { FILE_VALID_EXT } from 'shared/constants.js';


const useStyles = makeStyles(styles);


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});


function nameLengthValidator(file) {
  var valid = new RegExp(`^.*\.(${FILE_VALID_EXT})$`);

  if (file.name.length > FILE_NAME_MAX_LENGTH) {
    return {
      code: "name-too-large",
      message: `Name is larger than ${FILE_NAME_MAX_LENGTH} characters`
    };
  } else if (!valid.test(file.name)) {
    return {
      code: "invalid image type",
      message: `Invalid image type selected, Accept only jpg, jpeg, png or gif`
    };
  }

  return null
}


const KonvaCanvas = () => {
  const [tool, setTool] = useState('pen');
  const [value, setValue] = useState('');
  const [lines, setLines] = useState([]);
  const [texts, setTexts] = useState([]);
  const [modal, setModal] = useState(false);


  const [preview, setPreview] = useState("")
  const [selectedFile, setSelectedFile] = useState()


  const ref = useRef(null)
  const classes = useStyles();
  const stageRef = useRef(null);

  const isDrawing = useRef(false);




  const addText = () => {
    if (value) {
      setTool("text")
      setValue("")
      setTexts([...texts, { tool, text: value, points: [50, 50] }])
    }
  }


  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    console.log('[pos.x, pos.y] =>', [pos.x, pos.y]);
    switch (tool) {
      case "pen":
        console.log('tool =>', tool);
        isDrawing.current = true;
        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
        break;
      default:
        break;
    }
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };
  console.log("lines", lines);

  const undo = () => {
    let _lines = [...lines];
    _lines.pop()
    setLines(_lines)
  }


  const onDrop = useCallback(acceptedFiles => {
    console.log('acceptedFiles =>', acceptedFiles)
    try {
      const objectUrl = URL.createObjectURL(acceptedFiles[0])
      setPreview(objectUrl)
      setSelectedFile(acceptedFiles[0])
      setModal(true)
      setLines([])
      setTexts([])
    } catch (error) {
      console.log('error =>', error)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    validator: nameLengthValidator
  })
  console.log('fileRejections =>', fileRejections)

  const updateImageHandler = () => {
    // var canvas = document.getElementById("canvas");
    setModal(false)
    html2canvas(document.getElementsByClassName("stage")[0]).then(function (canvas) {
      console.log('canvas =>', canvas)
      var dataURL = canvas.toDataURL("image/png");
      console.log('dataURL =>', dataURL);
      setPreview(dataURL)
      // document.body.appendChild(canvas);
    });
  }

  // const updateImageHandler = useCallback(() => {
  //   console.log('updateImageHandler =>',);
  //   setModal(false)

  //   if (ref.current === null) {
  //     return
  //   }
  //   console.log('updateImageHandler =>',);


  //   toPng(ref.current, { cacheBust: true, })
  //     .then((dataUrl) => {
  //       console.log('dataUrl =>', dataUrl);
  //       setPreview(dataUrl)
  //       const link = document.createElement('a')
  //       link.download = 'my-image-name.png'
  //       link.href = dataUrl
  //       link.click()
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }, [ref])


  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    console.log("handleExport", uri);
    // we also can save uri as file
    // but in the demo on Konva website it will not work
    // because of iframe restrictions
    // but feel free to use it in your apps:
    // downloadURI(uri, 'stage.png');
  };

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map(e => (
          <li style={{ color: "red" }} key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));


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

      {fileRejectionItems}

      <Dialog
        classes={{
          root: classes.center,
          paper: classes.modal
        }}
        open={modal}
        transition={Transition}
        keepMounted
        onClose={() => setModal(false)}
        aria-labelledby="modal-slide-title"
        aria-describedby="modal-slide-description"
      >
        <DialogTitle
          id="classic-modal-slide-title"
          disableTypography
          className={classes.modalHeader}
        >
          <Button
            justIcon
            className={classes.modalCloseButton}
            key="close"
            aria-label="Close"
            color="transparent"
            onClick={() => setModal(false)}
          >
            <Close className={classes.modalClose} />
          </Button>
          <h4 className={classes.modalTitle}>Edit Image</h4>
        </DialogTitle>
        <DialogContent
          id="modal-slide-description"
          className={classes.modalBody}
        >
          <input type="text" value={value} placeholder="Enter text" onChange={(e) => setValue(e.target.value)} />
          <button onClick={() => addText()}>Text</button>
          <button onClick={() => setTool("pen")}>Pen</button>
          <button onClick={undo}>Undo</button>
          {/* <button onClick={handleExport}>Click here to log stage data URL</button> */}
          <Stage
            width={window.innerWidth}
            ref={stageRef}
            className="stage"
            id="stage"
            style={{ backgroundImage: `url(${preview})`, backgroundPosition: "top", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}
            height={500}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke="#df4b26"
                  strokeWidth={5}
                  tension={0.5}
                  lineCap="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
              <input type="text" />

              {texts && texts.map(text => <Text
                text={text.text}
                x={text.points[0]}
                y={text.points[1]}
                draggable
                fontSize={30}
                // fill={this.state.isDragging ? 'green' : 'black'}
                onDragStart={() => {
                  if (tool === "text") {
                    // undo()
                  }
                }}
                onDragEnd={e => {
                }}
              />
              )}

            </Layer>
          </Stage>



        </DialogContent>
        <DialogActions className={classes.modalFooter + " " + classes.modalFooterCenter} >
          <Button onClick={() => { updateImageHandler(); }} color="success">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};


export default KonvaCanvas
