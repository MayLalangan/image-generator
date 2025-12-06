// import express from 'express';


// const app = express();
// app.use(express.json());

// const port = 3000;


const myFunc = (num: number): number => {
  return num * num;
};

export default myFunc;

// app.get( "/api", (req, res) => {
//         res.send("Main endpoint.")
//         }); 

// // start the Express server
// app.listen(port, () => {
//   console.log(`server started at http://localhost:${port}`);
// });