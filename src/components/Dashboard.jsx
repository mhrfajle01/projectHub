import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Form, InputGroup, Dropdown, ButtonGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ProjectPreviewModal from './ProjectPreviewModal';
import { PROJECT_CATEGORIES, TECH_STACKS } from '../constants';

// Drag and Drop Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Col ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </Col>
  );
}

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
  
  // Batch Action State
  const [selectedIds, setSelectedIds] = useState([]);

  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid triggering on click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      
      // Sort by order if it exists, otherwise use fallback
      projectsData.sort((a, b) => (a.order || 0) - (b.order || 0));
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

    // 4. Sorting (only if not in default manual order)
    if (sortOption !== 'Manual') {
      result.sort((a, b) => {
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
    }

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

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} projects?`)) {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        batch.delete(doc(db, 'projects', id));
      });
      await batch.commit();
      setSelectedIds([]);
    }
  };

  const handleBulkPin = async (pinState) => {
    const batch = writeBatch(db);
    selectedIds.forEach(id => {
      batch.update(doc(db, 'projects', id), { pinned: pinState });
    });
    await batch.commit();
    setSelectedIds([]);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex(p => p.id === active.id);
    const newIndex = projects.findIndex(p => p.id === over.id);
    
    const newOrder = arrayMove(projects, oldIndex, newIndex);
    setProjects(newOrder);

    // Update orders in Firestore
    const batch = writeBatch(db);
    newOrder.forEach((p, index) => {
      batch.update(doc(db, 'projects', p.id), { order: index });
    });
    await batch.commit();
    setSortOption('Manual');
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
                {currentUser?.email}
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
          <h2 className="mb-0 fw-bold header-title">My Projects</h2>
          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <ButtonGroup className="shadow-sm me-3">
                <Button variant="outline-danger" onClick={handleBulkDelete}>Delete ({selectedIds.length})</Button>
                <Dropdown as={ButtonGroup}>
                  <Dropdown.Toggle split variant="outline-primary" id="dropdown-split-basic" />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleBulkPin(true)}>Pin Selected</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleBulkPin(false)}>Unpin Selected</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </ButtonGroup>
            )}
            <Button 
              className="border-0 shadow-sm btn-gradient-add"
              onClick={handleAddClick}
            >
              + Add Project
            </Button>
          </div>
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
            <Col md={2}>
              <Form.Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {PROJECT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={filterTech} onChange={e => setFilterTech(e.target.value)}>
                <option value="All">All Tech Stacks</option>
                {TECH_STACKS.map(tech => <option key={tech} value={tech}>{tech}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={sortOption} onChange={e => setSortOption(e.target.value)}>
                <option value="Manual">Manual Order</option>
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Name A-Z">Name (A-Z)</option>
                <option value="Name Z-A">Name (Z-A)</option>
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex align-items-center justify-content-end">
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setSelectedIds(selectedIds.length === filteredProjects.length ? [] : filteredProjects.map(p => p.id))}
              >
                {selectedIds.length === filteredProjects.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Col>
          </Row>
        </div>

        {/* Projects Grid with DND */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredProjects.map(p => p.id)}
            strategy={rectSortingStrategy}
          >
            <Row xs={1} md={2} lg={3} className="g-4">
              {filteredProjects.map(project => (
                <SortableItem key={project.id} id={project.id}>
                  <ProjectCard 
                    project={project} 
                    onDelete={handleDeleteClick} 
                    onPreview={handlePreviewClick}
                    onPin={handlePinClick}
                    onEdit={handleEditClick}
                    isSelected={selectedIds.includes(project.id)}
                    onSelect={handleSelect}
                  />
                </SortableItem>
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
          </SortableContext>
        </DndContext>
      </Container>

      <ProjectModal 
        show={showProjectModal} 
        handleClose={() => setShowProjectModal(false)} 
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
