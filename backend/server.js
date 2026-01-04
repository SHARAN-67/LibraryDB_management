import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://sharan_db_user:sharan123@cluster0.5csipmr.mongodb.net/?appName=Cluster0';
mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ Connection Error: ", err));

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

app.get('/api/books', async (req, res) => {
    const books = await Book.find({});
    res.json(books);
});

app.post('/api/books', async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// INCREASE Route
app.patch('/api/books/:id/increase', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, { $inc: { availableCopies: 1 } }, { new: true });
        res.json(book);
    } catch (err) { res.status(400).json({ message: "Update failed" }); }
});

// DECREASE Route
app.patch('/api/books/:id/decrease', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book.availableCopies > 0) {
            book.availableCopies -= 1;
            await book.save();
            res.json(book);
        } else { res.status(400).json({ message: "Stock is 0" }); }
    } catch (err) { res.status(400).json({ message: "Update failed" }); }
});

app.delete('/api/books', async (req, res) => {
    const ids = req.body;
    const book = await Book.findById(ids[0]);
    if (book && book.availableCopies === 0) {
        await Book.findByIdAndDelete(ids[0]);
        res.json({ message: "Deleted" });
    } else {
        res.status(400).json({ message: "Cannot delete: copies > 0" });
    }
});

app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));