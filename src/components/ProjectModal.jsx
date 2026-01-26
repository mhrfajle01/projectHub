import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Image } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { PROJECT_CATEGORIES } from '../constants';

export default function ProjectModal({ show, handleClose, projectToEdit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [category, setCategory] = useState(PROJECT_CATEGORIES[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
      setUrl(projectToEdit.url);
      setTechStack(projectToEdit.techStack ? projectToEdit.techStack.join(', ') : '');
      setCategory(projectToEdit.category || PROJECT_CATEGORIES[0]);
      setImagePreview(projectToEdit.imageUrl || null);
    } else {
      // Reset form
      setName('');
      setDescription('');
      setUrl('');
      setTechStack('');
      setCategory(PROJECT_CATEGORIES[0]);
      setImagePreview(null);
      setImageFile(null);
    }
    setError('');
  }, [projectToEdit, show]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation: 800KB limit for Firestore compatibility
      if (file.size > 800 * 1024) {
        setError('Image size must be less than 800KB for this free tier.');
        return;
      }
      setError('');
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

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

      let imageUrl = projectToEdit?.imageUrl || '';

      if (imageFile) {
        // Convert image to Base64 string for direct Firestore storage
        imageUrl = await convertToBase64(imageFile);
      }

      const projectData = {
        name,
        description, 
        url,
        techStack: techArray,
        category,
        imageUrl,
        updatedAt: serverTimestamp()
      };

      if (projectToEdit) {
        await updateDoc(doc(db, 'projects', projectToEdit.id), projectData);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          userId: currentUser.uid,
          pinned: false,
          createdAt: serverTimestamp()
        });
      }

      handleClose();
      // Reset is handled by useEffect when show changes
      if (!projectToEdit) {
        setName('');
        setDescription('');
        setUrl('');
        setTechStack('');
        setCategory(PROJECT_CATEGORIES[0]);
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error(err);
      const msg = `Failed to save project: ${err.message}`;
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{projectToEdit ? 'Edit Project' : 'Add New Project'}</Modal.Title>
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

          <Form.Group className="mb-3" controlId="projectImage">
            <Form.Label>Project Thumbnail (Max 800KB)</Form.Label>
            <Form.Control 
              type="file" 
              onChange={handleImageChange} 
              accept="image/*" 
            />
            {imagePreview && (
              <div className="mt-2 text-center p-2 bg-light rounded border">
                <Image src={imagePreview} fluid style={{ maxHeight: '150px' }} />
              </div>
            )}
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
