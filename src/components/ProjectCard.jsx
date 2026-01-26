import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ProjectCard({ project, onDelete, onPreview, onPin, onEdit }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Card className={`h-100 glass-card project-card ${project.pinned ? 'border-primary border-2' : ''} overflow-hidden`}>
      {project.imageUrl && (
        <div style={{ height: '180px', overflow: 'hidden', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Card.Img 
            variant="top" 
            src={project.imageUrl} 
            alt={project.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex flex-column w-75">
            <Card.Title className="h5 text-truncate fw-bold text-dark mb-0" title={project.name}>
              {project.name}
            </Card.Title>
            <small className="text-primary fw-bold" style={{ fontSize: '0.75rem' }}>
              {project.category || 'Uncategorized'}
            </small>
          </div>
          <div className="d-flex flex-column align-items-end">
            <small className="text-muted fw-semibold mb-1">{formatDate(project.createdAt)}</small>
            <Button 
              variant="link" 
              className="p-0 text-decoration-none shadow-none" 
              onClick={() => onPin(project)}
              title={project.pinned ? "Unpin Project" : "Pin Project"}
            >
              {project.pinned ? '📌' : '📍'}
            </Button>
          </div>
        </div>
        
        <div className="text-secondary flex-grow-1 mb-3" style={{ fontSize: '0.95rem' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            p: ({node, ...props}) => <p className="mb-1" {...props} />,
            a: ({node, ...props}) => <a className="text-primary" target="_blank" rel="noopener noreferrer" {...props} />
          }}>
            {project.description}
          </ReactMarkdown>
        </div>

        <div className="mb-3">
          {project.techStack && project.techStack.map((tech, index) => (
            <Badge 
              bg="transparent" 
              className="me-1 mb-1 tech-badge" 
              key={index}
            >
              {tech}
            </Badge>
          ))}
        </div>

        <div className="d-flex gap-2 mt-auto">
          <Button 
            size="sm" 
            onClick={() => onPreview(project)}
            className="flex-grow-1 border-0 fw-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            Preview
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => onEdit(project)}
            className="shadow-sm"
          >
            Edit
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => onDelete(project)}
            className="shadow-sm"
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
