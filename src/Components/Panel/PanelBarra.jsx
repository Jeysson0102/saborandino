/* =========================
   PanelBarra.jsx
   ========================= */
   import React from 'react';
   import { Navbar, Container, Form, InputGroup, Button, Dropdown } from 'react-bootstrap';
   import { FaBars, FaSearch, FaUserCircle } from 'react-icons/fa';
   import PropTypes from 'prop-types';
   
   const PanelBarra = ({ onMenuToggle }) => (
     <Navbar expand={false} variant="dark" className="panel-navbar shadow-sm bg-gradient-dark">
       <Container fluid className="align-items-center px-3">
         <Button variant="link" className="text-gold p-0 me-3" onClick={onMenuToggle}>
           <FaBars size={24} />
         </Button>
   
         <Navbar.Brand href="/" className="brand-glow text-gold fs-4 fw-bold">
           Sabor Andino
         </Navbar.Brand>
   
         <Form className="ms-auto d-none d-md-flex w-50">
           <InputGroup className="shadow-sm rounded-pill overflow-hidden">
             <Form.Control placeholder="Buscar platos..." className="border-0" />
             <Button variant="outline-gold" className="px-3">
               <FaSearch />
             </Button>
           </InputGroup>
         </Form>
   
         <Button variant="link" className="text-gold ms-3 d-md-none" onClick={onMenuToggle}>
           <FaSearch size={20} />
         </Button>
   
         <Dropdown align="end" className="ms-3">
           <Dropdown.Toggle variant="link" className="text-gold p-0">
             <FaUserCircle size={28} />
           </Dropdown.Toggle>
           <Dropdown.Menu align="end" className="bg-dark border-0 shadow-lg">
             <Dropdown.Item href="#/profile" className="text-white">Mi perfil</Dropdown.Item>
             <Dropdown.Item href="#/settings" className="text-white">Ajustes</Dropdown.Item>
             <Dropdown.Divider className="border-secondary" />
             <Dropdown.Item
               className="text-danger"
               onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
             >
               Cerrar sesión
             </Dropdown.Item>
           </Dropdown.Menu>
         </Dropdown>
       </Container>
     </Navbar>
   );
   
   PanelBarra.propTypes = {
     onMenuToggle: PropTypes.func.isRequired,
   };
   
   export default PanelBarra;