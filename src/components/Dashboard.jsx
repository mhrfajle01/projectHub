import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ProjectPreviewModal from './ProjectPreviewModal';
import { PROJECT_CATEGORIES, TECH_STACKS } from '../constants';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToPreview, setProjectToPreview] = useState(null);
  
  // Feature State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterTech, setFilterTech] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');

  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filtering & Sorting Logic
  useEffect(() => {
    let result = [...projects];

    // 1. Search (Name or Description)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        (p.description && p.description.toLowerCase().includes(lowerTerm))
      );
    }

    // 2. Filter by Category
    if (filterCategory !== 'All') {
      result = result.filter(p => p.category === filterCategory);
    }

    // 3. Filter by Tech Stack
    if (filterTech !== 'All') {
      result = result.filter(p => p.techStack && p.techStack.includes(filterTech));
    }

    // 4. Sorting
    result.sort((a, b) => {
      // Always put pinned items first if sort is not specific to something else (optional, but good UX)
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      switch (sortOption) {
        case 'Newest':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'Oldest':
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        case 'Name A-Z':
          return a.name.localeCompare(b.name);
        case 'Name Z-A':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredProjects(result);
  }, [projects, searchTerm, filterCategory, filterTech, sortOption]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error("Failed to log out");
    }
  }

  const handleAddClick = () => {
    setProjectToEdit(null);
    setShowProjectModal(true);
  };

  const handleEditClick = (project) => {
    setProjectToEdit(project);
    setShowProjectModal(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handlePreviewClick = (project) => {
    setProjectToPreview(project);
    setShowPreviewModal(true);
  };

  const handlePinClick = async (project) => {
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, {
      pinned: !project.pinned
    });
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteDoc(doc(db, 'projects', projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setProjectToEdit(null);
  };

  return (
    <>
      <Navbar expand="lg" className="glass-navbar mb-4 sticky-top">
        <Container>
          <Navbar.Brand className="fw-bold text-primary">Project Hub</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto ms-3 d-flex gap-2 align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={toggleTheme}
                className="rounded-circle border-0"
                title="Toggle Dark Mode"
                style={{ fontSize: '1.2rem', padding: '0 0.5rem' }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Item className="d-flex align-items-center me-3 text-muted">
                {currentUser.email}
              </Nav.Item>
              <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {/* Header & Add Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold header-title" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>My Projects</h2>
          <Button 
            className="border-0 shadow-sm"
            style={{ 
              background: 'linear-gradient(45deg, #FF512F, #DD2476)', 
              fontWeight: '600'
            }} 
            onClick={handleAddClick}
          >
            + Add Project
          </Button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 mb-4 rounded glass-card">
          <Row className="g-3">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control 
                  placeholder="Search projects..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {PROJECT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterTech} onChange={e => setFilterTech(e.target.value)}>
                <option value="All">All Tech Stacks</option>
                {TECH_STACKS.map(tech => <option key={tech} value={tech}>{tech}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={sortOption} onChange={e => setSortOption(e.target.value)}>
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Name A-Z">Name (A-Z)</option>
                <option value="Name Z-A">Name (Z-A)</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Projects Grid */}
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredProjects.map(project => (
            <Col key={project.id}>
              <ProjectCard 
                project={project} 
                onDelete={handleDeleteClick} 
                onPreview={handlePreviewClick}
                onPin={handlePinClick}
                onEdit={handleEditClick}
              />
            </Col>
          ))}
          {filteredProjects.length === 0 && (
            <Col className="w-100">
              <div className="text-center py-5 glass-card rounded text-muted">
                <h5>No projects found</h5>
                <p>Try adjusting your filters or add a new project.</p>
              </div>
            </Col>
          )}
        </Row>
      </Container>

      <ProjectModal 
        show={showProjectModal} 
        handleClose={handleCloseProjectModal} 
        projectToEdit={projectToEdit}
      />

      <DeleteConfirmModal 
        show={showDeleteModal} 
        handleClose={() => setShowDeleteModal(false)} 
        handleConfirm={confirmDelete}
        projectName={projectToDelete?.name}
      />

      <ProjectPreviewModal
        show={showPreviewModal}
        handleClose={() => setShowPreviewModal(false)}
        project={projectToPreview}
      />
    </>
  );
}
