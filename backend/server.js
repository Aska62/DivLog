import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// Use value defined on the env file
const port = process.env.PORT;

const app = express();

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.listen(port, () => console.log(`server is running on port ${port}`));