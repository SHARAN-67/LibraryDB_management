import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', category: '', publishedYear: '', availableCopies: 0 });

  const API = "http://localhost:5000/api/books";

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    const res = await axios.get(API);
    setBooks(res.data);
  };

  const handleStock = async (id, action) => {
    try {
      await axios.patch(`${API}/${id}/${action}`);
      fetchBooks(); // Refresh list from DB
    } catch (err) { alert(err.response.data.message); }
  };

  const deleteBook = async (id) => {
    const res = await axios.delete(API, { data: [id] });
    if (res.data.results.failed.length > 0) {
      alert("Error: " + res.data.results.failed[0].reason);
    }
    fetchBooks();
  };

  const addBook = async (e) => {
    e.preventDefault();
    await axios.post(API, formData);
    fetchBooks();
    setFormData({ title: '', author: '', category: '', publishedYear: '', availableCopies: 0 });
  };

  return (
    <div className="container">
      <h1>Library Book Management</h1>
      
      <form onSubmit={addBook} className="book-form">
        <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <input placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required />
        <input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
        <input type="number" placeholder="Year" value={formData.publishedYear} onChange={e => setFormData({...formData, publishedYear: e.target.value})} required />
        <input type="number" placeholder="Copies" value={formData.availableCopies} onChange={e => setFormData({...formData, availableCopies: e.target.value})} required />
        <button type="submit">Add Book</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Year</th>
            <th>Copies</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book._id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>{book.publishedYear}</td>
              <td>{book.availableCopies}</td>
              <td>
                <button className="btn-stock" onClick={() => handleStock(book._id, 'increase')}>+</button>
                <button className="btn-stock" onClick={() => handleStock(book._id, 'decrease')}>-</button>
                <button className="btn-delete" onClick={() => deleteBook(book._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;