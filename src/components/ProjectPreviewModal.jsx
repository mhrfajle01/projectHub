import React, { useState } from 'react';
import { Modal, Button, ButtonGroup, Dropdown } from 'react-bootstrap';

export default function ProjectPreviewModal({ show, handleClose, project }) {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile

  if (!project) return null;

  const getWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl" 
      centered 
      fullscreen={viewMode === 'desktop' ? 'xl-down' : false}
      contentClassName="glass-card overflow-hidden border-0 shadow-lg"
      dialogClassName="modal-90w"
    >
      {/* Browser-style Header */}
      <div className="bg-dark p-2 d-flex align-items-center gap-3 border-bottom border-secondary border-opacity-25" style={{ height: '50px' }}>
        {/* Window Controls */}
        <div className="d-flex gap-2 ms-2">
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
        </div>

        {/* Device Toggles */}
        <ButtonGroup size="sm" className="ms-3 bg-secondary bg-opacity-25 rounded p-1">
          <Button 
            variant={viewMode === 'desktop' ? 'light' : 'outline-light'} 
            className="border-0 py-0 px-2"
            onClick={() => setViewMode('desktop')}
            title="Desktop View"
          >
            🖥️
          </Button>
          <Button 
            variant={viewMode === 'tablet' ? 'light' : 'outline-light'} 
            className="border-0 py-0 px-2"
            onClick={() => setViewMode('tablet')}
            title="Tablet View"
          >
            📱
          </Button>
          <Button 
            variant={viewMode === 'mobile' ? 'light' : 'outline-light'} 
            className="border-0 py-0 px-2"
            onClick={() => setViewMode('mobile')}
            title="Mobile View"
          >
            🤳
          </Button>
        </ButtonGroup>

        {/* Address Bar */}
        <div className="flex-grow-1 mx-3 d-none d-md-block">
          <div className="bg-secondary bg-opacity-25 rounded px-3 py-1 text-white text-opacity-50 text-truncate" style={{ fontSize: '0.8rem' }}>
            {project.url}
          </div>
        </div>

        {/* Actions */}
        <div className="ms-auto d-flex align-items-center gap-2 me-2">
          <Button 
            variant="primary" 
            size="sm" 
            href={project.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fw-bold px-3 border-0"
            style={{ background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            Open Live Site ↗
          </Button>
          <Button variant="outline-light" size="sm" onClick={handleClose} className="border-0">
            ✖
          </Button>
        </div>
      </div>

      <Modal.Body className="p-0 bg-light d-flex justify-content-center align-items-start overflow-auto" style={{ height: '80vh' }}>
        <div 
          className="h-100 shadow-lg position-relative transition-all duration-300 ease-in-out" 
          style={{ 
            width: getWidth(), 
            backgroundColor: 'white',
            transition: 'width 0.3s ease'
          }}
        >
          {/* Loading / Fallback Layer */}
          <div className="position-absolute top-50 start-50 translate-middle text-muted text-center" style={{ zIndex: 0, width: '80%' }}>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="fw-bold text-dark">Connecting to Live Server...</h5>
            <p className="small">If the site doesn't load within a few seconds, it may be blocking embedded previews for security.</p>
            <Button 
              variant="outline-primary" 
              size="sm" 
              href={project.url} 
              target="_blank" 
              className="mt-2"
            >
              Click here to Open Manually
            </Button>
          </div>

          <iframe 
            src={project.url} 
            title={project.name}
            width="100%" 
            height="100%" 
            style={{ border: 'none', position: 'relative', zIndex: 1, backgroundColor: 'white' }}
            allowFullScreen
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}