import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sharan_db_user:sharan123@cluster0.5csipmr.mongodb.net/?appName=Cluster0';

let cachedConnection = null;

export async function connectDB() {
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        const connection = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        cachedConnection = connection;
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    publishedYear: { type: Number, required: true },
    availableCopies: { type: Number, required: true, min: 0 }
});

export const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

export function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}
