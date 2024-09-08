import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Tesseract from 'tesseract.js';
import multer from 'multer';
import sharp from 'sharp';
import certificatemodel from './model/certificatemodel.js';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/upload', express.static(path.join(__dirname, 'upload')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'upload'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage: storage });


async function preprocessImage(filePath) {
    try {
        const processedImagePath = 'processed_' + filePath;
        await sharp(filePath)
            .resize(1000)
            .grayscale()
            .toFile(processedImagePath);
        return processedImagePath;
    } catch (error) {
        console.error('Error in image preprocessing:', error);
        return filePath;
    }
}

app.post('/uploadcertificate', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filepath = await preprocessImage(req.file.path); 
        const originalFileName = req.file.originalname;
        const { aadhaarNumber, dateOfBirth, name } = req.body;

        const { data: { text: extractedText } } = await Tesseract.recognize(filepath, 'eng', {
            config: {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                psm: 7,
            },
            logger: (info) => console.log(info),
        });

        console.log('Extracted Text:', extractedText);

      
        const aadhaarNumberMatch = extractedText.match(/\d{4}\s\d{4}\s\d{4}/);
        const extractedAadhaarNumber = aadhaarNumberMatch ? aadhaarNumberMatch[0].replace(/\s/g, '') : null;

        const namematch = extractedText.match(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]*\b/m);
        const extractedname = namematch ? namematch[0].trim() : "";
       

        console.log('Extracted Aadhaar Number:', extractedAadhaarNumber); 
        console.log('Extracted Name:',extractedname);

        const isAadhaarValid = aadhaarNumber && aadhaarNumber.length === 12 && aadhaarNumber === extractedAadhaarNumber;
        const isNameValid = extractedname === name;
        const isValid = isAadhaarValid && isNameValid;

        const validationMessage = isValid ? 'Validation successful: Aadhaar number matches the document.' : 'Validation failed: Aadhaar number or name does not match the document.';

        const aadhaarDocument = new certificatemodel({
            originalFileName,
            filepath,
            extractedText,
            name,
            aadhaarNumber: extractedAadhaarNumber, 
            dateOfBirth,
            isValid,
            validationMessage
        });

        await aadhaarDocument.save();
        res.json({ success: isValid, message: validationMessage, names: name, aadhaarNumber: extractedAadhaarNumber });

    } catch (err) {
        console.error('Error during processing:', err);
        res.status(500).json({ error: 'Failed to process and validate the document.' });
    }
});

async function main() {
    await mongoose.connect('mongodb+srv://vicky:test123@cluster0.epdrsry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log("mongodb connected");
}

main().catch(err => console.log(err));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
