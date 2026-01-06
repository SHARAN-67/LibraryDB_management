import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const router = express.Router();

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sharan_db_user:sharan123@cluster0.5csipmr.mongodb.net/?appName=Cluster0';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(mongoURI);
        isConnected = true;
    } catch (err) {
        console.log("DB Connection Error:", err);
        throw err;
    }
};

// Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    publishedYear: { type: Number, required: true },
    availableCopies: { type: Number, required: true, min: 0 }
});
const Book = mongoose.model('Book', bookSchema);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectDB();

        if (req.method === 'GET') {
            const books = await Book.find({});
            res.status(200).json(books);
        } else if (req.method === 'POST') {
            const newBook = new Book(req.body);
            await newBook.save();
            res.status(201).json(newBook);
        } else if (req.method === 'DELETE') {
            const ids = req.body;
            const book = await Book.findById(ids[0]);
            if (book && book.availableCopies === 0) {
                await Book.findByIdAndDelete(ids[0]);
                res.status(200).json({ message: "Deleted" });
            } else {
                res.status(400).json({ message: "Cannot delete: copies > 0" });
            }
        } else {
            res.status(405).json({ message: "Method not allowed" });
        }
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ message: "Server error: " + err.message });
    }
}
