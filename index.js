const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Registration} = require('./models/registration')
const axios = require('axios');

const app = express();

// Middleware
app.use(bodyParser.json());

// Database connection
mongoose.connect('mongodb+srv://prantomunna:2020331107@cluster0.1suhm2u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Routes

// Define your API endpoint
app.get('/myapi', (req, res) => {
  const { subscriberId } = req.query;

  if (!subscriberId) {
      return res.status(400).json({ error: 'subscriberId query parameter is required' });
  }

  // Data to be sent in the request to the external API
  const requestData = {
      applicationId: 'APP_119147',
      password: '48a3e2a178e757c6f43fd7ab187f1419',
      subscriberId: `tel:${subscriberId}`,
      applicationHash: 'abcdefgh',
      applicationMetaData: {
          client: 'MOBILEAPP',
          device: 'HP 250 g8',
          os: 'Windows 10',
          appCode: 'https://blood-donation-app-z4ey.onrender.com'
      }
  };

  // Make a POST request to the external API
  axios.post('https://developer.bdapps.com/subscription/otp/request', requestData)
      .then(response => {
          console.log('External API response:', response.data);

          if (response.data.statusCode === 'S1000') {
              const referenceNo = response.data.referenceNo;

              // Save the referenceNo in the Registration model
              Registration.findOneAndUpdate(
                  { contact_no: subscriberId },
                  { $set: { referenceNo: referenceNo } },
                  { new: true, useFindAndModify: false },
                  (err, doc) => {
                      if (err) {
                          console.error('Error updating referenceNo:', err);
                          return res.status(500).json({ error: 'Error updating referenceNo' });
                      }
                      if (!doc) {
                          return res.status(404).json({ error: 'Registration not found' });
                      }
                      res.status(200).json({ message: 'API call successful and referenceNo updated', data: response.data });
                  }
              );
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
              // Update isVerified to true for the corresponding referenceNo
              Registration.findOneAndUpdate(
                  { referenceNo: referenceNo },
                  { $set: { isVerified: true } },
                  { new: true, useFindAndModify: false },
                  (err, doc) => {
                      if (err) {
                          console.error('Error updating isVerified:', err);
                          return res.status(500).json({ error: 'Error updating isVerified' });
                      }
                      if (!doc) {
                          return res.status(404).json({ error: 'Registration not found' });
                      }
                      res.status(200).json({ message: 'OTP verification successful and isVerified updated', data: response.data });
                  }
              );
          } else {
              res.json(response.data); // Send the API response to the client
          }
      })
      .catch(error => {
          console.error('Error calling external API:', error.response ? error.response.data : error.message);
          res.status(500).json(error.response ? error.response.data : error.message); // Send an error response to the client
      });
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));