const express = require('express');
const uploadRoutes = require('./routes/uploadRoutes'); // Import the router

const app = express(); // Create Express app instance

// Use the router for handling upload routes
app.use('/', uploadRoutes(app));

    // Servir o HTML da página principal
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });
    

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
