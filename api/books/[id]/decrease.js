import mongoose from 'mongoose';

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

    const { id } = req.query;

    try {
        await connectDB();

        if (req.method === 'PATCH') {
            const book = await Book.findById(id);
            if (book.availableCopies > 0) {
                book.availableCopies -= 1;
                await book.save();
                res.status(200).json(book);
            } else {
                res.status(400).json({ message: "Stock is 0" });
            }
        } else {
            res.status(405).json({ message: "Method not allowed" });
        }
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ message: "Server error: " + err.message });
    }
}
