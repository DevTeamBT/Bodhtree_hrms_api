const mongoose = require('mongoose');
const Country = require('../../schema/country/countrySchema');

const createCountry = async(req, res) => {
        try {
          const { name, states } = req.body;
          
          // Use 'new' to instantiate the model
          const country = new Country({ name, states });
          
          // Save the new country document to the database
          await country.save();
          
          // Respond with the created country
          res.status(201).json(country);
        } catch (error) {
          // Handle errors
          console.error(error);
          res.status(500).json({ message: 'Failed to create country' });
        }
      };
      


const getCountry = async(req,res) => {
    try {
        const country = await Country.findById(req.params.id);
        if (!country) {
          return res.status(404).json({ error: 'Country not found' });
        }
        res.json(country);  
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to get country' });
    }
};


const getState = async (req, res) => {
    try {
        const stateId = req.params.stateId;
    
        // Find the country that contains the state with the given stateId
        const country = await Country.findOne({ 'states._id': stateId });
    
        if (!country) {
          return res.status(404).json({ message: 'State not found' });
        }
    
        // Find the state that matches the stateId
        const state = country.states.find(state => state._id.toString() === stateId);
    
        if (!state) {
          return res.status(404).json({ message: 'State not found' });
        }
    
        // Return the cities of the matched state
        res.json(state.cities);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch cities of the state' });
      }
    };
    





module.exports = {
    createCountry:createCountry,
    getCountry:getCountry,
    getState:getState,

}