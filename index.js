const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
/*
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const bloodNeedersRoutes = require('./routes/bloodNeeders');
const bloodDonorsRoutes = require('./routes/bloodDonors');
*/
const Registration = require('./models/Registration'); // Ensure the path is correct

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
// Routes
/*
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/bloodNeeders', bloodNeedersRoutes);
app.use('/api/bloodDonors', bloodDonorsRoutes);
*/
// Define your API endpoint
app.get('/myapi', async (req, res) => {
  const { subscriberId } = req.query;
  if (!subscriberId) {
    return res.status(400).json({ error: 'subscriberId query parameter is required' });
  }

  // Data to be sent in the request to the external API
  const requestData = {
    applicationId: 'APP_119147',
    password: '48a3e2a178e757c6f43fd7ab187f1419',
    subscriberId: `tel:${subscriberId}`,
    applicationHash: 'pscjscsschsc',
    applicationMetaData: {
      client: 'MOBILEAPP',
      device: 'Dell Inspiron 3501',
      os: 'Windows 11',
      appCode: 'https://blood-donation-app-z4ey.onrender.com'
    }
  };

  try {
    // Make a POST request to the external API
    const response = await axios.post('https://developer.bdapps.com/subscription/otp/request', requestData);
    
    const responseData = response.data;
    
    if (responseData.statusCode === 'S1000') {
      // Extract referenceNo from the response
      const updatedRegistration = await Registration.findOneAndUpdate(
        { contact_no: subscriberId },
        { $set: { referenceNo: responseData.referenceNo } },
        { new: true, useFindAndModify: false }
      );

      if (updatedRegistration) {
        // Send response with referenceNo
        return res.status(200).json({
          statusCode: responseData.statusCode,
          referenceNo: responseData.referenceNo,
          statusDetail: responseData.statusDetail,
        });
      } else {
        return res.status(500).json({ error: 'Failed to update registration' });
      }
    } else {
      return res.status(404).json({ error: 'Failed to send data to bdapps.com/sub' });
    }
  } catch (error) {
    console.error('Error during API request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Endpoint for OTP verification
app.get('/verifyotp', async (req, res) => {
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

  try {
    // Make a POST request to the external API
    const response = await axios.post('https://developer.bdapps.com/subscription/otp/verify', requestData);
    const responseData = response.data;

    if (responseData.statusCode === 'S1000') {
      // Update the Registration record
      const updatedRegistration = await Registration.findOneAndUpdate(
        { referenceNo: referenceNo },
        { $set: { isVerified: true } },
        { new: true, useFindAndModify: false }
      );

      if (updatedRegistration) {
        // Send response with statusCode
        return res.status(200).json({
          statusCode: responseData.statusCode
        });
      } else {
        return res.status(500).json({ error: 'Failed to update registration' });
      }
    } else {
      return res.status(400).json({ error: 'Failed to verify OTP', statusCode: responseData.statusCode });
    }
  } catch (error) {
    console.error('Error during API request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Endpoint to update location for a specific contact_no

app.get('/registrations', async (req, res) => {
  try {
    const doc = await Registration.findOneAndUpdate(
      { contact_no: '8801623470338' },
      { $set: { location: "makhleo" } },
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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
