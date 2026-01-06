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
            const book = await Book.findByIdAndUpdate(id, { $inc: { availableCopies: 1 } }, { new: true });
            return res.status(200).json(book);
        } else {
            return res.status(405).json({ message: "Method not allowed" });
        }
    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ message: "Server error: " + err.message });
    }
}
