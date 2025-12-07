import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 8000;

// const myFunc = (num: number): number => {
//   return num * num;
// };

//export default myFunc;

app.get( "/health", (req, res) => {
        res.status(200).json({ status: "OK" });
        });

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
