const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const Registration = require('./models/registration'); // Ensure the path is correct

const app = express();

// Middleware
app.use(bodyParser.json());

// Database connection
mongoose.connect('mongodb+srv://prantomunna:2020331107@cluster0.1suhm2u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Routes

// Define your API endpoint
app.get('/myapi',(req, res) => {
    const { subscriberId } = req.query;
  
    if (!subscriberId) {
        return res.status(400).json({ error: 'subscriberId query parameter is required' });
    }
  
    // Data to be sent in the request to the external API
    const requestData = {
        applicationId: 'APP_119147',
        password: '48a3e2a178e757c6f43fd7ab187f1419',
        subscriberId: 'tel:${subscriberId}',
        applicationHash: 'pscjscsschsc',
        applicationMetaData: {
            client: 'MOBILEAPP',
            device: 'Dell Inspiron 3501',
            os: 'Windows 11',
            appCode: 'https://blood-donation-app-z4ey.onrender.com'
        }
    };
  
    // Make a POST request to the external API
    axios.post('https://developer.bdapps.com/subscription/otp/request', requestData)
        .then(response => {
            console.log('External API response:', response.data);
  
            if (response.data.statusCode === 'S1000') {
                const referenceNo = response.data.referenceNo;
  
                
                try {
                   const doc = Registration.findOneAndUpdate(
                    { contact_no: subscriberId },
                    { $set: { referenceNo: referenceNo } },
                    { new: true, useFindAndModify: false },
                  ).lean();
  
                  if (!doc) {
                      return res.status(404).json({ error: 'Registration not found' });
                  }
  
                  res.status(200).json({ message: 'API call successful and referenceNo updated', data: doc });
  
                } catch (error) {
                    console.error('Error updating referenceNo:', error);
                      res.status(500).json({ message: error.message });
  
              }
            } else {
                res.json(response.data); // Send the API response to the client
            }
        })
        .catch(error => {
            console.error('Error calling external API:', error.response ? error.response.data : error.message);
            res.status(500).json(error.response ? error.response.data : error.message); // Send an error response to the client
        });
  });
  
  
  // Endpoint for OTP verification
  app.get('/verifyotp', (req, res) => {
    const { otp, referenceNo } = req.query;
  
    if (!otp || !referenceNo) {
        return res.status(400).json({ error: 'otp and referenceNo query parameters are required' });
    }
  
    // Data to be sent in the request to the external API
    const requestData = {
        applicationId: 'APP_119147',
        password: '48a3e2a178e757c6f43fd7ab187f1419',
        referenceNo: referenceNo,
        otp: otp
    };
  
    // Make a POST request to the external API
    axios.post('https://developer.bdapps.com/subscription/otp/verify', requestData)
        .then(response => {
            console.log('External API response:', response.data);
  
            if (response.data.statusCode === 'S1000') {
              
                try {
                   const doc = Registration.findOneAndUpdate(
                    { referenceNo: referenceNo },
                    { $set: { isVerified: true } },
                    { new: true, useFindAndModify: false },
                  ).lean();
  
                  if (!doc) {
                      return res.status(404).json({ error: 'Registration not found' });
                  }
  
                  res.status(200).json({ message: 'OTP verification successful and isVerified updated', data: doc });
  
                } catch (error) {
                    console.error('Error updating isVerified:', error);
                      res.status(500).json({ message: error.message });
  
              }
            } else {
                res.json(response.data); // Send the API response to the client
            }
        })
        .catch(error => {
            console.error('Error calling external API:', error.response ? error.response.data : error.message);
            res.status(500).json(error.response ? error.response.data : error.message); // Send an error response to the client
        });
  });

// Endpoint to update location for a specific contact_no
/*
app.get('/registrations', async (req, res) => {
  try {
    const doc = await Registration.findOneAndUpdate(
      { contact_no: '8801623470338' },
      { $set: { location: "Akhaliiiiiiiii" } },
      { new: true, useFindAndModify: false }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.status(200).json({ message: 'API call successful and location updated', data: doc });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: error.message });
  }
});
*/
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
