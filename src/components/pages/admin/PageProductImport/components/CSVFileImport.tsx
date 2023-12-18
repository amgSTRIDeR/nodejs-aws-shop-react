import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log('uploadFile to', url);
    try {
      const token = localStorage.getItem('authorization_token');
      console.log('token: ', token);
      let base64Token = '';
      if (token) {
        base64Token = 'Basic ' + btoa(token);
      }
      console.log('base64Token: ', base64Token);

      // Get the presigned URL
      const response = await axios({
        method: 'GET',
        url,
        params: {
          name: encodeURIComponent((file as File).name),
        },
        headers: {
          Authorization: base64Token,
        },
      });
      console.log('File to upload: ', (file as File).name);
      console.log('Uploading to: ', response.data);
      const result = await fetch(response.data, {
        method: 'PUT',
        body: file,
      });
      console.log('Result: ', result);
      setFile(undefined);
    } catch (error) {
      console.log('Error: ', error);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
