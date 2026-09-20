import express from 'express';
import cors from 'cors';

const port = process.env.PORT || 3000;
const app = express();

const games = [];

app.use(cors());

app.use(express.json({ limit: "10kb" }));

app.get("/boards", (req, res) => {
    res.json(games);
});

app.post("/boards", (req, res) => {
    console.log(req.body);
    games.push(req.body);
    res.json({ message: "Game Saved"});
});

app.delete("/boards", (req, res) => {
    games.length = 0;
    res.json({ message: "History Cleared" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});