import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sharan_db_user:sharan123@cluster0.5csipmr.mongodb.net/?appName=Cluster0';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("Connection Error:", err);
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

// --- API ROUTES ---

app.get('/', async (req, res) => {
    try {
        await connectDB();
        const books = await Book.find({});
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch books: " + err.message });
    }
});

app.post('/', async (req, res) => {
    try {
        await connectDB();
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.patch('/:id/increase', async (req, res) => {
    try {
        await connectDB();
        const book = await Book.findByIdAndUpdate(req.query.id || req.params.id, { $inc: { availableCopies: 1 } }, { new: true });
        res.json(book);
    } catch (err) {
        res.status(400).json({ message: "Update failed: " + err.message });
    }
});

app.patch('/:id/decrease', async (req, res) => {
    try {
        await connectDB();
        const bookId = req.query.id || req.params.id;
        const book = await Book.findById(bookId);
        if (book.availableCopies > 0) {
            book.availableCopies -= 1;
            await book.save();
            res.json(book);
        } else {
            res.status(400).json({ message: "Stock is 0" });
        }
    } catch (err) {
        res.status(400).json({ message: "Update failed: " + err.message });
    }
});

app.delete('/', async (req, res) => {
    try {
        await connectDB();
        const ids = req.body;
        const book = await Book.findById(ids[0]);
        if (book && book.availableCopies === 0) {
            await Book.findByIdAndDelete(ids[0]);
            res.json({ message: "Deleted" });
        } else {
            res.status(400).json({ message: "Cannot delete: copies > 0" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default app;

