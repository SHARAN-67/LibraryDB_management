import { connectDB, Book, setCorsHeaders } from '../utils/db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectDB();

        if (req.method === 'GET') {
            const books = await Book.find({});
            return res.status(200).json(books);
        } else if (req.method === 'POST') {
            const newBook = new Book(req.body);
            await newBook.save();
            return res.status(201).json(newBook);
        } else if (req.method === 'DELETE') {
            const ids = req.body;
            const book = await Book.findById(ids[0]);
            if (book && book.availableCopies === 0) {
                await Book.findByIdAndDelete(ids[0]);
                return res.status(200).json({ message: "Deleted" });
            } else {
                return res.status(400).json({ message: "Cannot delete: copies > 0" });
            }
        } else {
            return res.status(405).json({ message: "Method not allowed" });
        }
    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ message: "Server error: " + err.message });
    }
}
