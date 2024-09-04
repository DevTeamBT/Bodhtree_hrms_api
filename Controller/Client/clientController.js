const mongoose = require('mongoose');
const CompanySchema = require('../../schema/Client/clientSchema');
const Country = require('../../schema/country/countrySchema');
const { name } = require('ejs');
const Company = require('../../schema/Client/clientSchema');


const createCompany = async (req, res) => {
    try {
      const { countryID, stateID, cityID, ...companyData } = req.body;
  
      // Fetch country by its ID
      const country = await Country.findById(countryID);
  
      if (!country) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
  
      // Find the state within the country's states array
      const state = country.states.find((state) => state._id.equals(stateID));
  
      if (!state) {
        return res.status(400).json({ message: "Invalid state ID" });
      }
  
      // Find the city within the state's cities array
      const city = state.cities.find((city) => city._id.equals(cityID));
  
      if (!city) {
        return res.status(400).json({ message: "Invalid city ID" });
      }
  
      // Create a new company object with the fetched names
      const newCompany = new CompanySchema({
        ...companyData,
        country: country.name,  
        state: state.name,      
        city: city.name,        
      });
  
      const savedCompany = await newCompany.save();
      res.status(201).json(savedCompany);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create company information' });
    }
  };
  
  
const getCompany = async(req,res) => {
    try {
        const company = await Company.findById(req.params.id);
        if(!company){
            return res.status(404).json({message: "Company not found"});
        }
        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to getcompany information' });
      }
}


const getCompanies = async(req,res) => {
    try {
        const company = await Company.find();
        if(!company){
            return res.status(404).json({message: "Company not found"});
        }
        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to getcompany information' });
      }
}












module.exports = {
    createCompany:createCompany,
    getCompany:getCompany,
    getCompanies:getCompanies,

}