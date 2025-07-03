// src/App.js  (actualizado)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth
import PrivateRoute from './Components/Auth/PrivateRoute';

// Públicas
import { Inicio } from './Components/Public/Inicio';
import { Nosotros } from './Components/Public/Nosotros';
import { Servicios } from './Components/Public/Servicios';
import { Contacto } from './Components/Public/Contacto';
import { Reserva } from './Components/Public/Reserva';
import { Login } from './Components/Public/Login';
import { Navegacion } from './Components/Public/Navegacion';
import { Footer } from './Components/Public/Footer';

// Panel
import Panel from './Components/Panel/Panel';

import AdminInicio   from './Components/Panel/AdminInicio';
import AdminMesas    from './Components/Panel/AdminMesas';
import AdminReservas from './Components/Panel/AdminReservas';
import AdminCarta    from './Components/Panel/AdminCarta';
import Reportes    from './Components/Panel/Reportes';

const App = () => (
  <Router>
    <Routes>
      {/* Públicas */}
      {['/', '/nosotros', '/servicios', '/contacto', '/reserva', '/login'].map(path => {
        const Comp = {
          '/': Inicio,
          '/nosotros': Nosotros,
          '/servicios': Servicios,
          '/contacto': Contacto,
          '/reserva': Reserva,
          '/login': Login,
        }[path];
        return (
          <Route
            key={path}
            path={path}
            element={
              <>
                <Navegacion />
                <Comp />
                <Footer />
              </>
            }
          />
        );
      })}

      {/* Panel protegido */}
      <Route
        path="/panel/*"
        element={
          <PrivateRoute>
            <Panel />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminInicio />} />
        <Route path="inicio"   element={<AdminInicio />} />
        <Route path="mesas"    element={<AdminMesas />} />
        <Route path="reservas" element={<AdminReservas />} />
        <Route path="carta"    element={<AdminCarta />} />
        <Route path="reportes"    element={<Reportes />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
