const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let items = [];



// Get all items
app.get('/', (req, res) => {
    res.send("Hello 72 USD");
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
