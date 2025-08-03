const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION = process.env.MEDIAFIRE_SESSION_TOKEN;

app.use(express.json({ limit: '100mb' }));

app.post('/tools/mdfupbase', async (req, res) => {
  const { apikey, filename, buffer } = req.body;

  if (apikey !== 'bagus') {
    return res.status(403).json({ success: false, message: 'API key salah' });
  }

  if (!filename || !buffer) {
    return res.status(400).json({ success: false, message: 'Missing filename or buffer' });
  }

  try {
    const fileBuffer = Buffer.from(buffer, 'base64');

    const form = new FormData();
    form.append('file', fileBuffer, filename);

    await axios.post(
      `https://www.mediafire.com/api/1.5/upload/simple.php?session_token=${SESSION}`,
      form,
      { headers: form.getHeaders() }
    );

    const { data } = await axios.post(
      'https://www.mediafire.com/api/1.5/folder/get_content.php',
      null,
      {
        params: {
          session_token: SESSION,
          folder_key: 'myfiles',
          content_type: 'files',
          response_format: 'json',
        },
      }
    );

    const last = data?.response?.folder_content?.files?.[0];
    if (!last?.links?.normal_download) {
      return res.json({ success: false, message: 'Gagal ambil link download' });
    }

    return res.json({ success: true, url: last.links.normal_download });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
