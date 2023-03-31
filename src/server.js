const express = require('express');
const routes = require('./routes')
const uploadConfig = require('./configs/upload');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER));
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})