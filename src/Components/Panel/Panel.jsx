import React, { useState } from 'react';
import { Container, Row, Col, Offcanvas } from 'react-bootstrap';
import PanelBarra from './PanelBarra';
import PanelMenu from './PanelMenu';
import { Outlet } from 'react-router-dom';

const Panel = () => {
  const [showMenu, setShowMenu] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className={`panel-layout d-flex flex-column vh-100 ${showMenu ? 'sidebar-collapsed' : ''}`}>
      {/* Barra superior */}
      <PanelBarra onMenuToggle={() => setShowMenu(prev => !prev)} />

      <Container fluid className="flex-grow-1 p-0">
        <Row className="h-100 g-0">
          {/* Sidebar en desktop */}
          <Col
            xs={0} md={3} lg={2}
            className="d-none d-md-block panel-sidebar"
          >
            <PanelMenu onLinkClick={() => {}} />
          </Col>

          {/* Contenido principal */}
          <Col className="panel-content overflow-auto">
            <div>
              <Outlet />
            </div>
            <footer className="text-center py-3 text-muted small">
              © Sabor Andino {year} ·{' '}
              <a href="/privacy" className="link-fancy">Privacidad</a> ·{' '}
              <a href="/terms" className="link-fancy">Términos</a>
            </footer>
          </Col>
        </Row>
      </Container>

      {/* Offcanvas para mobile */}
      <Offcanvas
        show={showMenu}
        onHide={() => setShowMenu(false)}
        backdrop
        scroll={false}
        className="bg-vino text-white"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>Sabor Andino</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <PanelMenu onLinkClick={() => setShowMenu(false)} />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Panel;
