import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Beaker,
  Briefcase,
  Calendar,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Home,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Users,
  Sun,
  Moon,
  Plus,
  Brain,
  Sparkles,
  Trophy,
  Frown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProjectCard, { getProgressFromStage } from './components/ProjectCard';
import QuotationIndicator from './components/QuotationIndicator';
import Modal from './components/Modal';
import logo from './assets/logo.png';
import db from './data/db.json';
import './App.css';

// New Components
import AIBrain from './components/AIBrain';
import AdvancedInsights from './components/AdvancedInsights';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterType, setFilterType] = useState('All');
  const [filterSector, setFilterSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isNewClient, setIsNewClient] = useState(true);
  const [newProject, setNewProject] = useState({
    name: '', client: '', sector: 'Extractiva', stage: 'Opportunidad', type: 'R&D', progress: 0, description: ''
  });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '', type: 'Reunión', date: new Date().toISOString().slice(0, 16), associatedClient: '', associatedProject: ''
  });

  const [isAIBrainModalOpen, setIsAIBrainModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [closingData, setClosingData] = useState({ status: 'Closed Won', reason: '' });


  // Load Initial Data
  useEffect(() => {
    const savedProjects = localStorage.getItem('ptc_projects');
    const savedActivities = localStorage.getItem('ptc_activities');
    const savedQuotations = localStorage.getItem('ptc_quotations');

    const ensureProjectTracking = (p) => ({
      ...p,
      createdAt: p.createdAt || new Date().toISOString(),
      stageHistory: p.stageHistory || { [p.stage]: new Date().toISOString() },
      status: p.status || 'Active'
    });

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects).map(ensureProjectTracking));
    } else {
      setProjects(db.projects.map(ensureProjectTracking));
    }

    if (savedActivities) setActivities(JSON.parse(savedActivities));
    else setActivities(db.activities);

    if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
    else setQuotations(db.quotations || []);
  }, []);

  // Persist Data
  useEffect(() => {
    if (projects.length > 0) localStorage.setItem('ptc_projects', JSON.stringify(projects));
    if (activities.length > 0) localStorage.setItem('ptc_activities', JSON.stringify(activities));
    if (quotations.length > 0) localStorage.setItem('ptc_quotations', JSON.stringify(quotations));
  }, [projects, activities, quotations]);

  const industries = [
    'Extractiva', 'Retail', 'Salud', 'Logística',
    'Recursos Humanos', 'Gobierno', 'Turismo', 'Construcción', 'Energía',
    'Deportes', 'Industrias Creativas', 'Patrimonio', 'Automotriz'
  ];

  // CLP currency formatter
  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const projectToAdd = {
      ...newProject,
      id: Date.now(),
      progress: getProgressFromStage(newProject.stage),
      createdAt: now,
      stageHistory: { [newProject.stage]: now },
      status: 'Active'
    };
    setProjects([projectToAdd, ...projects]);
    setIsProjectModalOpen(false);
    setNewProject({ name: '', client: '', sector: industries[0], stage: 'Opportunidad', type: 'R&D', progress: 0, description: '' });

    // Add activity
    const activity = {
      id: Date.now(),
      type: 'review',
      title: `Nuevo proyecto creado: ${projectToAdd.name}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setActivities([activity, ...activities]);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const typeAlias = project.type === 'R&D' ? 'R&D Project' : 'I+D Service';

      // Filter by Tab
      let tabMatch = true;
      if (activeTab === 'projects') tabMatch = project.type === 'R&D';
      if (activeTab === 'services') tabMatch = project.type === 'Service';

      // Filter by Top Viz Tabs (All, R&D, Service)
      const typeMatch = filterType === 'All' || typeAlias === filterType;

      // Filter by Sector
      const sectorMatch = filterSector === 'All' || project.sector === filterSector;

      // Filter by Search
      const searchMatch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.sector.toLowerCase().includes(searchQuery.toLowerCase());

      return tabMatch && typeMatch && sectorMatch && searchMatch;
    });
  }, [projects, activeTab, filterType, filterSector, searchQuery]);

  // AI Integration Handler
  const handleProjectExtracted = (extracted) => {
    const now = new Date().toISOString();
    const projectToAdd = {
      id: Date.now(),
      name: extracted.name,
      client: extracted.client,
      sector: extracted.sector,
      stage: 'Opportunidad', // Default start
      type: extracted.amount > 100000 ? 'R&D' : 'Service',
      progress: 0,
      description: extracted.description,
      sr: extracted.sr,
      amount: extracted.amount,
      createdAt: now,
      stageHistory: { 'Opportunidad': now },
      status: 'Active'
    };

    setProjects([projectToAdd, ...projects]);

    // Add quotation if it's a new lead
    if (extracted.status === 'Prospección' || extracted.status === 'Venta') {
      const quotation = {
        id: Date.now() + 1,
        client: extracted.client,
        sector: extracted.sector,
        amount: extracted.amount,
        date: new Date().toISOString().split('T')[0],
        status: extracted.status
      };
      setQuotations([quotation, ...quotations]);
    }

    // Add activity
    const activity = {
      id: Date.now() + 2,
      type: 'review',
      title: `⚡ AI Autodetect: Nuevo proyecto de ${extracted.client} (${extracted.sector})`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setActivities([activity, ...activities]);
  };

  // Statistics
  const activeProjectsCount = projects.filter(p => p.status === 'Active' && p.stage !== 'Validar' && p.stage !== 'Escalar').length;
  const servicesCount = projects.filter(p => p.type === 'Service').length;

  // Unique clients from projects
  const projectClients = useMemo(() => {
    return [...new Set(projects.map(p => p.client).filter(Boolean))];
  }, [projects]);

  // Advanced Statistics
  const totalQuoted = useMemo(() => quotations.reduce((sum, q) => sum + (q.amount || 0), 0), [quotations]);
  const closingRate = useMemo(() => {
    const won = projects.filter(p => p.status === 'Closed Won').length;
    const lost = projects.filter(p => p.status === 'Closed Lost').length;
    const totalClosed = won + lost;

    if (totalClosed > 0) return Math.round((won / totalClosed) * 100);

    // Fallback: historical ratio if no actual closures exist in this session
    const totalOpportunities = projects.length + quotations.length;
    return totalOpportunities > 0 ? Math.round((projects.length / totalOpportunities) * 100) : 0;
  }, [projects, quotations]);

  const leadSector = useMemo(() => {
    const counts = {};
    projects.forEach(p => counts[p.sector] = (counts[p.sector] || 0) + 1);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'N/A';
  }, [projects]);

  const handleDeleteProject = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      const projectToDelete = projects.find(p => p.id === id);
      setProjects(projects.filter(p => p.id !== id));

      const activity = {
        id: Date.now(),
        type: 'review',
        title: `Proyecto eliminado: ${projectToDelete?.name}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed'
      };
      setActivities([activity, ...activities]);
    }
  };

  const handleAddQuotation = (quotation) => {
    setQuotations([quotation, ...quotations]);

    // Add activity
    const activity = {
      id: Date.now(),
      type: 'review',
      title: `Nueva cotización: ${quotation.client} por ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(quotation.amount)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setActivities([activity, ...activities]);
  };

  const handleUpdateStage = (id, newStage) => {
    const projectToUpdate = projects.find(p => p.id === id);
    const oldStage = projectToUpdate?.stage;
    const newProgress = getProgressFromStage(newStage);
    const now = new Date().toISOString();

    setProjects(projects.map(p =>
      p.id === id ? {
        ...p,
        stage: newStage,
        progress: newProgress,
        stageHistory: {
          ...(p.stageHistory || {}),
          [newStage]: now
        }
      } : p
    ));

    const activity = {
      id: Date.now(),
      type: 'review',
      title: `Proyecto "${projectToUpdate?.name}" movido de ${oldStage} a ${newStage}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setActivities([activity, ...activities]);
  };

  const handleCloseProject = (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const { status, reason } = closingData;

    setProjects(projects.map(p =>
      p.id === selectedProject.id ? {
        ...p,
        status: status, // 'Closed Won' or 'Closed Lost'
        closureReason: reason,
        closedAt: new Date().toISOString()
      } : p
    ));

    const activity = {
      id: Date.now(),
      type: 'review',
      title: `Proyecto "${selectedProject.name}" cerrado: ${status === 'Closed Won' ? 'Ganado' : 'Perdido'} - Razón: ${reason}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setActivities([activity, ...activities]);
    setIsClosingModalOpen(false);
    setClosingData({ status: 'Closed Won', reason: '' });
  };

  const openClosingModal = (project) => {
    setSelectedProject(project);
    setIsClosingModalOpen(true);
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    const activity = {
      id: Date.now(),
      type: 'manual', // Distinguish from auto-generated logs
      tag: newActivity.type,
      title: newActivity.title,
      date: newActivity.date.split('T')[0],
      time: newActivity.date.split('T')[1],
      status: 'Pending',
      associatedClient: newActivity.associatedClient || null,
      associatedProject: newActivity.associatedProject || null
    };
    setActivities([activity, ...activities]);
    setIsActivityModalOpen(false);
    setNewActivity({ title: '', type: 'Reunión', date: new Date().toISOString().slice(0, 16), associatedClient: '', associatedProject: '' });
  };

  const handleViewProject = (project) => {
    // Ensure amount field exists, default to 0 if not present
    const projectToEdit = { ...project, amount: project.amount || 0 };
    setSelectedProject(projectToEdit);
    setIsViewModalOpen(true);
  };

  const handleUpdateProjectDetails = (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    setProjects(projects.map(p => p.id === selectedProject.id ? selectedProject : p));
    setIsViewModalOpen(false);

    const activity = {
      id: Date.now(),
      type: 'review',
      title: `Información actualizada: ${selectedProject.name}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setActivities([activity, ...activities]);
  };

  const stages = ['Opportunidad', 'Exploración', 'Investigar', 'Desarrollar', 'Testear', 'Validar', 'Escalar'];

  const getProjectsCountByStage = (stage) => {
    return filteredProjects.filter(p => p.stage === stage).length;
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <aside className="glass-card sidebar">
        <div className="logo">
          <div className="logo-circle">
            {logo ? <img src={logo} alt="CRTIC Logo" className="brand-logo" /> : <Layers color="white" />}
          </div>
          <h2>PTC Manager</h2>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => { setActiveTab('projects'); setFilterType('All'); }}>
            <FlaskConical size={20} />
            <span>R&D Projects</span>
          </div>
          <div className={`nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => { setActiveTab('services'); setFilterType('All'); }}>
            <Briefcase size={20} />
            <span>I+D Services</span>
          </div>
          <div className={`nav-item ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
            <Calendar size={20} />
            <span>Activities</span>
          </div>
        </nav>

        <div className="sidebar-divider"></div>

        <div className="industries-section">
          <h3>Sectors</h3>
          <div className="industry-list">
            <div
              className={`industry-item ${filterSector === 'All' ? 'active' : ''}`}
              onClick={() => setFilterSector('All')}
            >
              <Layers size={14} />
              <span>All Sectors</span>
            </div>
            {industries.map(industry => (
              <div
                key={industry}
                className={`industry-item ${filterSector === industry ? 'active' : ''}`}
                onClick={() => setFilterSector(industry)}
              >
                <Layers size={14} />
                <span>{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="search-bar glass-card">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects, clients, or activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            className="ai-brain-btn"
            onClick={() => setIsAIBrainModalOpen(true)}
            title="Cerebro de IA - Analizar Minutas"
          >
            <div className="ai-brain-btn-inner">
              <Brain size={18} />
              <span>IA</span>
            </div>
            <div className="ai-brain-btn-glow" />
          </button>

          <div className="header-actions">
            <button className="icon-btn glass-card theme-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Cambiar a modo día' : 'Cambiar a modo noche'}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="user-profile glass-card">
              <img src="https://ui-avatars.com/api/?name=Admin+PTC&background=ff6b4a&color=fff" alt="User" />
              <div className="user-info">
                <span className="user-name">Admin PTC</span>
                <span className="user-role">Lab Director</span>
              </div>
            </div>
            <button className="add-btn grad-orange-pink" onClick={() => setIsProjectModalOpen(true)}>
              <Plus size={20} />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <section className="dashboard-stats">
              <div className="glass-card stat-card">
                <div className="stat-info">
                  <span className="label">Active Projects</span>
                  <span className="value">{activeProjectsCount}</span>
                  <span className="trend pos">Live now</span>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-info">
                  <span className="label">Total Cotizado</span>
                  <span className="value">{formatCLP(totalQuoted)}</span>
                  <span className="trend pos">Acumulado</span>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-info">
                  <span className="label">% Cierre</span>
                  <span className="value">{closingRate}%</span>
                  <span className="trend pos">Conversion rate</span>
                </div>
              </div>
            </section>

            <section className="quotations-overview">
              <QuotationIndicator quotations={quotations} industries={industries} onAddQuotation={handleAddQuotation} projectClients={projectClients} />
            </section>

            <section className="content-grid main-grid">

              <div className="glass-card main-viz">
                <div className="viz-header">
                  <h3>Project Lifecycle</h3>
                  <div className="viz-tabs">
                    <span className={filterType === 'All' ? 'active' : ''} onClick={() => setFilterType('All')}>All</span>
                    <span className={filterType === 'R&D Project' ? 'active' : ''} onClick={() => setFilterType('R&D Project')}>R&D Projects</span>
                    <span className={filterType === 'I+D Service' ? 'active' : ''} onClick={() => setFilterType('I+D Service')}>I+D Services</span>
                  </div>
                </div>
                <div className="lifecycle-track">
                  {stages.map((stage) => {
                    const count = getProjectsCountByStage(stage);
                    const hasProjects = count > 0;
                    return (
                      <div key={stage} className={`stage-node ${hasProjects ? 'has-projects' : ''}`}>
                        <div className="node-dot">
                          {hasProjects && <span className="node-count">{count}</span>}
                        </div>
                        <span className="node-label">{stage}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="viz-separator" style={{ margin: '32px 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}></div>

                <div className="viz-header">
                  <h3>Project Distribution Area</h3>
                  <div className="lead-sector-badge">
                    <span className="badge-label">Sector Líder</span>
                    <span className="badge-value">{leadSector}</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stages.map(stage => ({ name: stage, projects: getProjectsCountByStage(stage) }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6b4a" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ff6b4a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: '#ff6b4a', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="projects" stroke="#ff6b4a" fillOpacity={1} fill="url(#colorProjects)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card activities-feed">
                <div className="feed-header">
                  <h3>Recent Activities</h3>
                  <button className="icon-btn-small" onClick={() => setIsActivityModalOpen(true)} title="Registrar actividad">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="activity-list">
                  {activities.slice(0, 5).map((activity, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-icon grad-blue-purple">
                        {activity.type === 'tour' ? <Users size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="activity-details">
                        <span className="activity-title">
                          {activity.tag && <span className="activity-tag">{activity.tag}: </span>}
                          {activity.title}
                        </span>
                        <span className="activity-time">{activity.time || activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-10">
              <AdvancedInsights projects={projects} quotations={quotations} tourData={{ fromTour: 15, direct: 9 }} />
            </section>
          </>
        )}

        {activeTab === 'activities' && (
          <section className="activities-full glass-card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>All Activities</h3>
            <div className="activity-list">
              {activities.map((activity, i) => (
                <div key={i} className="activity-item" style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="activity-icon grad-blue-purple" style={{ width: '40px', height: '40px' }}>
                    {activity.type === 'tour' ? <Users size={18} /> : <MessageSquare size={18} />}
                  </div>
                  <div className="activity-details">
                    <span className="activity-title" style={{ fontSize: '1.1rem' }}>{activity.title}</span>
                    <span className="activity-time">{activity.date} at {activity.time}</span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className={`type-badge ${activity.status === 'Completed' ? 'rd' : 'service'}`}>{activity.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'dashboard' || activeTab === 'projects' || activeTab === 'services') && (
          <section className="projects-section">
            <div className="section-header">
              <h3>{activeTab === 'dashboard' ? 'Recent Projects' : activeTab === 'projects' ? 'R&D Projects' : 'I+D Services'}</h3>
              {activeTab === 'dashboard' && <button className="view-all" onClick={() => setActiveTab('projects')}>View all projects <ChevronRight size={16} /></button>}
            </div>
            <div className="projects-grid">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={handleDeleteProject}
                    onUpdateStage={handleUpdateStage}
                    onView={handleViewProject}
                    onCloseClick={openClosingModal}
                  />
                ))
              ) : (
                <div className="no-results">No projects found for the selected filters.</div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* New Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => { setIsProjectModalOpen(false); setIsNewClient(true); }} title="Crear Nuevo Proyecto">
        <form onSubmit={handleAddProject}>
          <div className="form-group">
            <label>Nombre del Proyecto</label>
            <input required type="text" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="Ej. Plan de Optimización IA" />
          </div>
          <div className="form-group">
            <label>Cliente</label>
            <div className="client-toggle" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <button
                type="button"
                className={`toggle-btn ${isNewClient ? 'active' : ''}`}
                onClick={() => { setIsNewClient(true); setNewProject({ ...newProject, client: '' }); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: isNewClient ? '2px solid var(--accent-primary)' : '1px solid rgba(0,0,0,0.1)',
                  background: isNewClient ? 'rgba(255, 107, 74, 0.1)' : 'transparent',
                  fontWeight: isNewClient ? '600' : '400',
                  cursor: 'pointer'
                }}
              >
                Nuevo Cliente
              </button>
              <button
                type="button"
                className={`toggle-btn ${!isNewClient ? 'active' : ''}`}
                onClick={() => setIsNewClient(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: !isNewClient ? '2px solid var(--accent-primary)' : '1px solid rgba(0,0,0,0.1)',
                  background: !isNewClient ? 'rgba(255, 107, 74, 0.1)' : 'transparent',
                  fontWeight: !isNewClient ? '600' : '400',
                  cursor: 'pointer'
                }}
              >
                Cliente Existente
              </button>
            </div>
            {isNewClient ? (
              <input required type="text" value={newProject.client} onChange={e => setNewProject({ ...newProject, client: e.target.value })} placeholder="Nombre del nuevo cliente" />
            ) : (
              <select required value={newProject.client} onChange={e => setNewProject({ ...newProject, client: e.target.value })}>
                <option value="" disabled>Seleccionar cliente...</option>
                {projectClients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Sector</label>
              <select value={newProject.sector} onChange={e => setNewProject({ ...newProject, sector: e.target.value })}>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Tipo</label>
              <select value={newProject.type} onChange={e => setNewProject({ ...newProject, type: e.target.value })}>
                <option value="R&D">Proyecto R&D</option>
                <option value="Service">Servicio I+D</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Progreso (%)</label>
            <input type="number" min="0" max="100" value={newProject.progress} onChange={e => setNewProject({ ...newProject, progress: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea rows="3" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="Breve descripción del proyecto..."></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => { setIsProjectModalOpen(false); setIsNewClient(true); }}>Cancelar</button>
            <button type="submit" className="btn-primary">Crear Proyecto</button>
          </div>
        </form>
      </Modal>

      {/* Activity Modal */}
      <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="Registrar Actividad">
        <form onSubmit={handleAddActivity}>
          <div className="form-group">
            <label>Tipo de Actividad</label>
            <select
              value={newActivity.type}
              onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
            >
              <option value="Reunión">Reunión</option>
              <option value="Taller">Taller</option>
              <option value="Evento">Evento</option>
            </select>
          </div>
          <div className="form-group">
            <label>Descripción / Título</label>
            <input
              type="text"
              required
              placeholder="Ej. Reunión con cliente X"
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Fecha y Hora</label>
            <input
              type="datetime-local"
              required
              value={newActivity.date}
              onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
            />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Asociar a Cliente <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(opcional)</span></label>
              <select
                value={newActivity.associatedClient}
                onChange={(e) => setNewActivity({ ...newActivity, associatedClient: e.target.value })}
              >
                <option value="">Sin asociar</option>
                {projectClients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Asociar a Proyecto <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(opcional)</span></label>
              <select
                value={newActivity.associatedProject}
                onChange={(e) => setNewActivity({ ...newActivity, associatedProject: e.target.value })}
              >
                <option value="">Sin asociar</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsActivityModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>

      {/* Closing Modal */}
      <Modal isOpen={isClosingModalOpen} onClose={() => setIsClosingModalOpen(false)} title="Cerrar Oportunidad">
        {selectedProject && (
          <form onSubmit={handleCloseProject}>
            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
              <h4 style={{ margin: 0, color: 'var(--accent-primary)' }}>{selectedProject.name}</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedProject.client}</p>
            </div>

            <div className="form-group">
              <label>Resultado del Cierre</label>
              <div className="closure-type-selector" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  className={`choice-btn ${closingData.status === 'Closed Won' ? 'active won' : ''}`}
                  onClick={() => setClosingData({ ...closingData, status: 'Closed Won' })}
                >
                  <Trophy size={18} />
                  <span>Ganado (Won)</span>
                </button>
                <button
                  type="button"
                  className={`choice-btn ${closingData.status === 'Closed Lost' ? 'active lost' : ''}`}
                  onClick={() => setClosingData({ ...closingData, status: 'Closed Lost' })}
                >
                  <Frown size={18} />
                  <span>Perdido (Lost)</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Razón del Cierre</label>
              <textarea
                required
                rows="4"
                value={closingData.reason}
                onChange={(e) => setClosingData({ ...closingData, reason: e.target.value })}
                placeholder="Indica detalladamente por qué se cerró esta oportunidad..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsClosingModalOpen(false)}>Regresar</button>
              <button type="submit" className={`grad-${closingData.status === 'Closed Won' ? 'orange-pink' : 'blue-purple'}`} style={{
                padding: '12px 24px',
                borderRadius: '16px',
                border: 'none',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: closingData.status === 'Closed Won' ? '0 8px 16px rgba(255,107,74,0.2)' : '0 8px 16px rgba(74,144,226,0.2)'
              }}>
                Confirmar Cierre
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* AI Brain Modal */}
      <Modal isOpen={isAIBrainModalOpen} onClose={() => setIsAIBrainModalOpen(false)} title="Cerebro de IA">
        <AIBrain onProjectExtracted={(data) => {
          handleProjectExtracted(data);
          setIsAIBrainModalOpen(false);
        }} />
      </Modal>

      {/* View/Edit Project Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Editar Información del Proyecto">
        {selectedProject && (
          <form onSubmit={handleUpdateProjectDetails}>
            <div className="form-group">
              <label>Nombre del Proyecto</label>
              <input
                type="text"
                required
                value={selectedProject.name}
                onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Cliente</label>
                <input
                  type="text"
                  required
                  value={selectedProject.client}
                  onChange={(e) => setSelectedProject({ ...selectedProject, client: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Sector</label>
                <select
                  value={selectedProject.sector}
                  onChange={(e) => setSelectedProject({ ...selectedProject, sector: e.target.value })}
                >
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Tipo</label>
                <select
                  value={selectedProject.type}
                  onChange={(e) => setSelectedProject({ ...selectedProject, type: e.target.value })}
                >
                  <option value="R&D">Proyecto R&D</option>
                  <option value="Service">Servicio I+D</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Monto Cotización (CLP)</label>
                <input
                  type="number"
                  min="0"
                  value={selectedProject.amount}
                  onChange={(e) => setSelectedProject({ ...selectedProject, amount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                rows="4"
                value={selectedProject.description}
                onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsViewModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar Cambios</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default App;
