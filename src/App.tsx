import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globals.css';

// Components
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';

// Pages
import Home from './pages/Home/Home';
import Fixtures from './pages/Fixtures/Fixtures';
import League from './pages/League/League';
import Stats from './pages/Stats/Stats';
import Insights from './pages/Insights/Insights';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/fixtures/:id" element={<Stats />} />
            <Route path="/table" element={<League />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
