const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer();

const sessionToken = "1d8430531515645a37db428dc6af50c03e2dd1471a87eee31d4dafecc4112d6729ccd6aad45ea64f967e0139d2633a162f8ea83c94f24a76c0855977a4f5a25bcbdef27ab18e2623";

app.post("/tools/mdfup", upload.single("file"), async (req, res) => {
  const apikey = req.query.apikey;
  if (apikey !== "bagus") {
    return res.status(403).json({ success: false, message: "API key salah!" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "File tidak ditemukan!" });
  }

  try {
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      `https://www.mediafire.com/api/1.5/upload/simple.php?session_token=${sessionToken}`,
      form,
      { headers: form.getHeaders() }
    );

    const xml = response.data;
    const match = xml.match(/<key>(.*?)<\/key>/);

    if (!match) {
      return res.status(500).json({ success: false, message: "Gagal mendapatkan key upload." });
    }

    const key = match[1];
    const finalUrl = `https://www.mediafire.com/file/${key}/file`;

    return res.json({ success: true, url: finalUrl });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal upload ke MediaFire.", error: err.message });
  }
});

app.get("/", (_, res) => {
  res.send("✅ Endpoint aktif: POST /tools/mdfup");
});

app.listen(3000, () => {
  console.log("Server ready on port 3000");
});
