import React, { useState, useEffect } from 'react';
import { Modal, Button, ButtonGroup, Dropdown } from 'react-bootstrap';

export default function ProjectPreviewModal({ show, handleClose, project }) {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showScreenshot, setShowScreenshot] = useState(false);

  useEffect(() => {
    if (show) {
      setShowScreenshot(false);
      setIframeLoading(true);
    }
  }, [show, project]);

  if (!project) return null;

  // Ensure URL has protocol
  const getValidUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const projectUrl = getValidUrl(project.url);

  const getWidth = () => {
    if (showScreenshot) return '100%';
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
      fullscreen={viewMode === 'desktop' || showScreenshot ? 'xl-down' : false}
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
        {!showScreenshot && (
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
        )}

        {/* Address Bar */}
        <div className="flex-grow-1 mx-3 d-none d-md-block">
          <div className="bg-secondary bg-opacity-25 rounded px-3 py-1 text-white text-opacity-50 text-truncate" style={{ fontSize: '0.8rem' }}>
            {showScreenshot ? 'Viewing Project Screenshot' : projectUrl}
          </div>
        </div>

        {/* Actions */}
        <div className="ms-auto d-flex align-items-center gap-2 me-2">
          {project.imageUrl && (
             <Button 
                variant={showScreenshot ? 'light' : 'outline-secondary'}
                size="sm"
                onClick={() => setShowScreenshot(!showScreenshot)}
                className="me-2"
                title="Toggle Screenshot"
             >
                {showScreenshot ? '🌐 Live Site' : '📷 Screenshot'}
             </Button>
          )}

          <Button 
            variant="primary" 
            size="sm" 
            href={projectUrl} 
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
          {showScreenshot && project.imageUrl ? (
             <div className="w-100 h-100 d-flex justify-content-center align-items-center bg-dark">
                <img 
                    src={project.imageUrl} 
                    alt={project.name} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
             </div>
          ) : (
             <>
                {/* Loading / Fallback Layer */}
                <div className="position-absolute top-50 start-50 translate-middle text-muted text-center" style={{ zIndex: 0, width: '80%' }}>
                    <div className={`spinner-border text-primary mb-3 ${!iframeLoading ? 'd-none' : ''}`} role="status">
                    <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="fw-bold text-dark">{iframeLoading ? 'Connecting to Live Server...' : 'Preview Loaded'}</h5>
                    <p className="small mb-1">If the site is blank or refuses to connect, it is blocking embedded previews.</p>
                    <p className="small text-danger fw-bold mb-2">Note: Logins often fail in previews due to browser security. Open externally to log in.</p>
                </div>

                <iframe 
                    src={projectUrl} 
                    title={project.name}
                    width="100%" 
                    height="100%" 
                    onLoad={() => setIframeLoading(false)}
                    style={{ 
                    border: 'none', 
                    position: 'relative', 
                    zIndex: 1, 
                    opacity: iframeLoading ? 0 : 1,
                    transition: 'opacity 0.5s ease'
                    }}
                    allowFullScreen
                />
             </>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}