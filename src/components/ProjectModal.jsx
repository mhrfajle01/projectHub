import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Image, InputGroup, Spinner } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { PROJECT_CATEGORIES } from '../constants';

export default function ProjectModal({ show, handleClose, projectToEdit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [category, setCategory] = useState(PROJECT_CATEGORIES[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingGithub, setFetchingGithub] = useState(false);
  const [capturingScreenshot, setCapturingScreenshot] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
      setUrl(projectToEdit.url);
      setGithubUrl(projectToEdit.githubUrl || '');
      setTechStack(projectToEdit.techStack ? projectToEdit.techStack.join(', ') : '');
      setCategory(projectToEdit.category || PROJECT_CATEGORIES[0]);
      setImagePreview(projectToEdit.imageUrl || null);
    } else {
      // Reset form
      setName('');
      setDescription('');
      setUrl('');
      setGithubUrl('');
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

  const fetchGithubDetails = async () => {
    if (!githubUrl) return setError('Please enter a GitHub URL first.');
    
    // Extract owner/repo
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = githubUrl.match(regex);
    if (!match) return setError('Invalid GitHub URL format.');

    const [, owner, repo] = match;
    const cleanRepo = repo.replace('.git', '');

    try {
      setFetchingGithub(true);
      setError('');
      const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`);
      if (!response.ok) throw new Error('Repository not found or API limit reached.');
      
      const data = await response.json();
      
      if (!name) setName(data.name || '');
      if (!description) setDescription(data.description || '');
      if (!url && data.homepage) setUrl(data.homepage);
      
      const tech = [];
      if (data.language) tech.push(data.language);
      
      // Merge with existing tech stack
      const currentTech = techStack.split(',').map(t => t.trim()).filter(t => t);
      const combined = Array.from(new Set([...tech, ...currentTech])).join(', ');
      setTechStack(combined);

    } catch (err) {
      setError(`GitHub Fetch Error: ${err.message}`);
    } finally {
      setFetchingGithub(false);
    }
  };

  const captureScreenshot = async () => {
    if (!url) return setError('Please enter a Live Project URL first.');
    
    try {
      setCapturingScreenshot(true);
      setError('');
      // Using Microlink API to get a screenshot
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to capture screenshot.');
      
      const data = await response.json();
      const screenshotUrl = data.data.screenshot.url;
      
      // Convert to base64 to store in Firestore (optional, but consistent with current approach)
      const imgResponse = await fetch(screenshotUrl);
      const blob = await imgResponse.blob();
      
      if (blob.size > 800 * 1024) {
        // Fallback: just use the URL directly if it's too big, or warn
        // But Microlink URLs are ephemeral. Let's try to resize or just use as is if small enough.
        // For now, let's just use the converted base64 if it fits.
      }
      
      const base64 = await convertToBase64(blob);
      setImagePreview(base64);
      setImageFile(null); // Clear manual file if we have a screenshot
    } catch (err) {
      setError(`Screenshot Error: ${err.message}`);
    } finally {
      setCapturingScreenshot(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !url) {
      return setError('Project Name and URL are required.');
    }

    try {
      setError('');
      setLoading(true);

      const techArray = techStack.split(',').map(item => item.trim()).filter(item => item !== '');

      let imageUrl = projectToEdit?.imageUrl || '';

      if (imageFile) {
        imageUrl = await convertToBase64(imageFile);
      } else if (imagePreview && imagePreview.startsWith('data:image')) {
        // Case where image was captured via screenshot
        imageUrl = imagePreview;
      }

      const projectData = {
        name,
        description, 
        url,
        githubUrl,
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
          clicks: 0,
          createdAt: serverTimestamp()
        });
      }

      handleClose();
    } catch (err) {
      console.error(err);
      setError(`Failed to save project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{projectToEdit ? 'Edit Project' : 'Add New Project'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>GitHub Repository URL</Form.Label>
            <InputGroup>
              <Form.Control 
                type="url" 
                placeholder="https://github.com/user/repo" 
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <Button 
                variant="outline-dark" 
                onClick={fetchGithubDetails}
                disabled={fetchingGithub}
              >
                {fetchingGithub ? <Spinner size="sm" /> : 'Fetch Details'}
              </Button>
            </InputGroup>
          </Form.Group>

          <hr />

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
              placeholder="Describe your project..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="projectUrl">
            <Form.Label>Live Project URL</Form.Label>
            <InputGroup>
              <Form.Control 
                type="url" 
                placeholder="https://example.com" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Button 
                variant="outline-info" 
                onClick={captureScreenshot}
                disabled={capturingScreenshot}
              >
                {capturingScreenshot ? <Spinner size="sm" /> : 'Auto-Capture Screenshot'}
              </Button>
            </InputGroup>
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
              <div className="mt-2 text-center p-2 bg-light rounded border position-relative">
                <Image src={imagePreview} fluid style={{ maxHeight: '150px' }} />
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="position-absolute top-0 end-0 m-1"
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                >
                  ✕
                </Button>
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
