import { connectDB, Book, setCorsHeaders } from '../../utils/db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    try {
        await connectDB();

        if (req.method === 'PATCH') {
            const book = await Book.findById(id);
            if (book.availableCopies > 0) {
                book.availableCopies -= 1;
                await book.save();
                return res.status(200).json(book);
            } else {
                return res.status(400).json({ message: "Stock is 0" });
            }
        } else {
            return res.status(405).json({ message: "Method not allowed" });
        }
    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ message: "Server error: " + err.message });
    }
}
