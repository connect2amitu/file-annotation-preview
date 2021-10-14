import React, { useCallback, useState } from 'react';
import { useDropzone } from "react-dropzone";
import Table from "components/Table/Table.js";
import { FILE_VALID_EXT } from 'shared/constants';


function parseResult(result) {
  var resultArray = [];
  result.split("\n").forEach(function (row) {
    var rowArray = [];
    row.split(",").forEach(function (cell) {
      rowArray.push(cell);
    });
    resultArray.push(rowArray);
  });
  return resultArray;
}

const FileAndPreview = () => {
  const [selectedFile, setSelectedFile] = useState()
  const [tableData, setTableData] = useState([])
  const [tableHeading, setTableHeading] = useState([])
  const [fileType, setFileType] = useState("")
  const [preview, setPreview] = useState("")



  const onDrop = useCallback(acceptedFiles => {
    console.log('acceptedFiles =>', acceptedFiles)
    const file = acceptedFiles[0]
    try {
      setSelectedFile(file)
      var reader = new FileReader();
      var f = file;
      reader.onload = function (e) {

        var validCSV = new RegExp(`^.*\.(csv)$`);
        var validPDF = new RegExp(`^.*\.(pdf)$`);
        if (validCSV.test(file.name)) {
          setFileType("csv")
          var CSVARRAY = parseResult(e.target.result); //this is where the csv array will be
          console.log('CSVARRAY =>', CSVARRAY)
          setTableHeading(CSVARRAY[0])
          CSVARRAY.splice(0, 1)
          setTableData(CSVARRAY)
        } else if (validPDF.test(file.name)) {
          setFileType("pdf")
          const objectUrl = URL.createObjectURL(acceptedFiles[0])
          setPreview(objectUrl)
        }

      };
      reader.readAsText(f);
    } catch (error) {
      console.log('error =>', error)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    // validator: nameLengthValidator
  })

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

  console.log('tableHeading =>', tableHeading)
  console.log('tableData =>', tableData)
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
      {fileType !== "" ? `fileType: ${fileType}` : ""}
      {fileRejectionItems}
      {fileType === "pdf" && <embed
        src={preview}
        style={{ width: "100%", height: "700px" }}
      />
      }

      {fileType === "csv" && <Table
        tableHeaderColor="primary"
        tableHead={tableHeading}
        tableData={tableData}
        coloredColls={[3]}
        colorsColls={["primary"]}
      />}

    </div>
  );
};


export default FileAndPreview
