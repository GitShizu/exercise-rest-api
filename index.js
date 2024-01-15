import fs from 'fs';
import path from 'path';
import express from 'express'
import morgan from 'morgan'
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const { MONGO_URI } = process.env;
import mongoose from 'mongoose';
import Musician from './models/musician.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
    origin: '*'
}));

// //VIEW RESOURCE LIST
app.get('/musicians/', async (req, res) => {
    
    try{
        const musicians = await Musician.find();
        res.send(musicians)
    }catch(e){
        res.status(500).send(e.message);
    }
})


//ADD NEW RESOURCE
app.post('/musicians/', async (req, res) => {
    try{
        const newResource = req.body;
        const musician = await Musician.create(newResource);
        res.send(musician);
    }catch(e){
        res.status(400).send(e.message)
    }
})

// //VIEW RESOURCE BY ID
// app.get(`/${resourceType}/:id`, (req, res) => {
//     const resource = checkSingleResource(resourceType, req, res)[0];
//     res.send(resource);
// })

// //DELETE RESOURCE BY ID
// app.delete(`/${resourceType}/:id`, (req, res) => {
//     const indexToDelete = checkSingleResource(resourceType, req, res)[1];
//     const resourceList = readResources(resourceType);
//     resourceList.splice(indexToDelete, 1);
//     writeResources(resourceType, resourceList);
//     res.send(resourceList);
// })

// //REPLACE RESOURCE BY ID
// app.put(`/${resourceType}/:id`, (req, res) => {
//     const newResource = req.body;
//     const isValid = isResourceValid(resourceProps, newResource);
//     if (!isValid) {
//         res.status(400).send(`${resourceType} must include ${resourceProps}. Up to 2 additional properties can be included (optional)`)
//         return;
//     };
//     const indexToUpdate = checkSingleResource(resourceType, req, res)[1];
//     const resourceList = readResources(resourceType);
//     resourceList[indexToUpdate] = { ...newResource, id: Number(req.params.id) };
//     writeResources(resourceType, resourceList)
//     res.send(resourceList);
// })

// //EDIT RESOURCE PROPERTIES BY ID
// app.patch(`/${resourceType}/:id`, (req, res) => {
//     const newProps = req.body;
//     if (Object.keys(newProps).length > resourceProps.length + 1) {
//         res.status(400).send(`Up to ${resourceProps.length + 1} properties can be edited. To edit all properties use the replace method.`)
//         return;
//     }
//     if (Object.keys(newProps).includes('id')) {
//         res.status(400).send('the "id" property is read-only')
//         return;
//     }
//     const resourceList = readResources(resourceType);
//     const indexToUpdate = checkSingleResource(resourceType, req, res)[1];
//     const newResource = { ...resourceList[indexToUpdate], ...newProps }
//     let isNewPropsValid = true;
//     resourceProps.forEach((prop) => {
//         isNewPropsValid &= Object.keys(newResource).includes(prop);
//     })
//     if (!isNewPropsValid) {
//         res.status(400).send(`${resourceType} must include ${resourceProps}. Up to 2 additional properties can be included (optional)`)
//         return;
//     };
//     resourceList[indexToUpdate] = { ...resourceList[indexToUpdate], ...newResource };
//     writeResources(resourceType, resourceList)
//     res.send(resourceList);
// })

//ENDPOINTS
mongoose.connect(MONGO_URI)
    .then(()=> {
        console.log('Successfully connected to MongoDB');
        app.listen(3000, () => {
            console.log('Server running - listening at port 3000');
        })
    }).catch(err => console.error(err))


