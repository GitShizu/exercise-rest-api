import mongoose from "mongoose";
const {Schema, model} = mongoose;

const musicianSchema = new Schema({
    name: String,
    last_name: String,
    occupation: String
})

const Musician = model('Musician', musicianSchema)

export default Musician;