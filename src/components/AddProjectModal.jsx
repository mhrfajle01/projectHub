import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { PROJECT_CATEGORIES } from '../constants';

export default function AddProjectModal({ show, handleClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [category, setCategory] = useState(PROJECT_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !url) {
      return setError('Project Name and URL are required.');
    }

    try {
      setError('');
      setLoading(true);

      // Parse tech stack (comma separated)
      const techArray = techStack.split(',').map(item => item.trim()).filter(item => item !== '');

      await addDoc(collection(db, 'projects'), {
        userId: currentUser.uid,
        name,
        description, // Supports markdown
        url,
        techStack: techArray,
        category,
        pinned: false, // Default unpinned
        createdAt: serverTimestamp()
      });

      handleClose();
      // Reset form
      setName('');
      setDescription('');
      setUrl('');
      setTechStack('');
      setCategory(PROJECT_CATEGORIES[0]);
    } catch (err) {
      console.error(err);
      const msg = `Failed to add project: ${err.message}`;
      setError(msg);
      alert(msg); // Force user attention to the specific error
    }

    setLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="projectName">
            <Form.Label>Project Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="e.g., Portfolio Website" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="projectCategory">
            <Form.Label>Category</Form.Label>
            <Form.Select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {PROJECT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="projectDescription">
            <Form.Label>Description (Markdown Supported)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Describe your project... You can use **markdown**!" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="projectUrl">
            <Form.Label>Live Project URL</Form.Label>
            <Form.Control 
              type="url" 
              placeholder="https://example.com" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="projectTech">
            <Form.Label>Tech Stack (comma separated)</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="React, Firebase, Bootstrap" 
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
