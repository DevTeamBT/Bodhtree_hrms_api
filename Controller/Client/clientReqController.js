const mongoose = require('mongoose');
const CompanyReqSchema = require('../../schema/Client/clientReqSchema');
const Country = require('../../schema/country/countrySchema');
const { name } = require('ejs');
const Company = require('../../schema/Client/clientSchema');


const createCompanyReq = async (req, res) => {
      try {
        const { client_Id, firstName, lastName, jobTitle, department, country, state, city, ...rest } = req.body;

        // Fetch the referenced Company details
        const company = await Company.findById(client_Id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Create a new client request with references to the company
        const newClientReq = new CompanyReqSchema({
            client_Id: company._id,
            country: company.country,
            state: company.state,
            city: company.city,
            firstName,
            lastName,
            jobTitle,
            department,
            ...rest
        });

        const savedClientReq = await newClientReq.save();

        res.status(201).json({
            message: 'Client request created successfully',
            data: savedClientReq
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create company information' });
    }
  };


const getCompanyReq = async(req,res) => {
      try {
        const clientReq = await CompanyReqSchema.findById(req.params.id);
        if(!clientReq){
          return res.status(404).json({message: "Client Requiement not found"});
      }
      res.json(clientReq);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch company information' });
      }
};

const getCompaniesReq = async(req,res) => {
  try {
    const clientReq = await CompanyReqSchema.find();
    if(!clientReq){
      return res.status(404).json({message:"Client Requirement and Client Contact not found"});
    }
    res.json(clientReq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch company information' });
  }
};


  module.exports = {
    createCompanyReq:createCompanyReq,
    getCompanyReq:getCompanyReq,
    getCompaniesReq:getCompaniesReq,
}