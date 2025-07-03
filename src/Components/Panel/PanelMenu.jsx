/* =========================
   PanelMenu.jsx
   ========================= */
   import React from 'react';
   import { Nav } from 'react-bootstrap';
   import { NavLink } from 'react-router-dom';
   import { FaHome, FaUtensils, FaCalendarAlt, FaTable, FaChartPie } from 'react-icons/fa';
   
   const menuItems = [
     { to: '/panel/inicio', icon: <FaHome />, label: 'Inicio' },
     { to: '/panel/carta', icon: <FaUtensils />, label: 'Carta' },
     { to: '/panel/reservas', icon: <FaCalendarAlt />, label: 'Reservas' },
     { to: '/panel/mesas', icon: <FaTable />, label: 'Mesas' },
     { to: '/panel/reportes', icon: <FaChartPie />, label: 'Reportes' },
   ];
   
   const PanelMenu = ({ onLinkClick }) => (
     <Nav className="flex-column h-100 justify-content-start">
       <div className="text-center mb-4">
         <h5 className="text-gold fw-bold">Panel de Control</h5>
       </div>
       {menuItems.map(({ to, icon, label }) => (
         <NavLink
           key={to}
           to={to}
           className={({ isActive }) =>
             `nav-link d-flex align-items-center mb-3 py-2 px-3 rounded transition-fast ${
               isActive
                 ? 'active bg-oro text-vino shadow-inner'
                 : 'text-white hover-bg-gold hover-text-vino'
             }`
           }
           onClick={onLinkClick}
         >
           <div className="me-3 fs-5">{icon}</div>
           <span className="fw-semibold">{label}</span>
         </NavLink>
       ))}
     </Nav>
   );
   
   export default PanelMenu;