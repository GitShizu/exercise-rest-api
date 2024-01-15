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
    try {
        const musicians = await Musician.find();
        res.send(musicians)
    } catch (e) {
        res.status(500).send(e.message);
    }
})


//ADD NEW RESOURCE
app.post('/musicians/', async (req, res) => {
    try {
        const musician = await Musician.create(req.body);
        const musicians = await Musician.find();
        res.send(musicians);
    } catch (e) {
        res.status(400).send(e.message)
    }
})

// //VIEW RESOURCE BY ID
app.get('/musicians/:id', async (req, res) => {
    try {
        const { id } = req.params
        const musician = await Musician.findById(id);
        res.send(musician)
    } catch (e) {
        res.status(404).send(e.message);
    }
})

// //DELETE RESOURCE BY ID
app.delete(`/musicians/:id`, async (req, res) => {
    try {
        const { id } = req.params
        await Musician.findByIdAndDelete(id);
        const musicians = await Musician.find();
        res.send(musicians)
    } catch (e) {
        res.status(404).send(e.message);
    }
})

// //EDIT/REPLACE RESOURCE BY ID
app.patch(`/musicians/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        await Musician.findByIdAndUpdate(id, req.body);
        const musician = await Musician.findById(id);
        res.send(musician);
    } catch (e) {
        res.status(404).send(e.message)
    }
})

//ENDPOINTS
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        app.listen(3000, () => {
            console.log('Server running - listening at port 3000');
        })
    }).catch(err => console.error(err))


