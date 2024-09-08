import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    originalFileName: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    name:{
        type:String,
        required:true
    },
    extractedText: {
        type: String,
        required: true
    },
    translatedText: {
        type: String,
    },
    aadhaarNumber: {
        type: String,
        required: true ,
    
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    isValid: {
        type: Boolean,
        required: true
    },
    validationMessage: {
        type: String,
        required: true
    }
});

const certificatemodel = mongoose.model('Certificate', certificateSchema);

export default certificatemodel;
