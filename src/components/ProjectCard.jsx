import React, { useState } from 'react';
import { Layers, FlaskConical, Briefcase, Trash2, Edit3, Check, X, Eye, Clock, AlertTriangle, Trophy, Frown, MessageSquare, DoorClosed, DollarSign } from 'lucide-react';

const STAGES = ['Opportunidad', 'Exploración', 'Investigar', 'Desarrollar', 'Testear', 'Validar', 'Escalar'];

// Stage to Progress mapping
export const STAGE_PROGRESS = {
    'Opportunidad': 10,
    'Exploración': 25,
    'Investigar': 50,
    'Desarrollar': 75,
    'Testear': 85,
    'Validar': 95,
    'Escalar': 100
};

export const getProgressFromStage = (stage) => {
    return STAGE_PROGRESS[stage] || 0;
};

const ProjectCard = ({ project, onDelete, onUpdateStage, onView, onCloseClick }) => {
    const isRD = project.type === 'R&D' || project.type === 'R&D Project';
    const [isEditingStage, setIsEditingStage] = useState(false);
    const [selectedStage, setSelectedStage] = useState(project.stage);

    // Calculate progress based on stage
    const progress = getProgressFromStage(project.stage);

    const handleSaveStage = () => {
        onUpdateStage(project.id, selectedStage);
        setIsEditingStage(false);
    };

    const handleCancelEdit = () => {
        setSelectedStage(project.stage);
        setIsEditingStage(false);
    };

    const getTimeDifference = (date) => {
        if (!date) return 0;
        const now = new Date();
        const created = new Date(date);
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysSinceCreation = getTimeDifference(project.createdAt);
    const daysInStage = getTimeDifference(project.stageHistory?.[project.stage] || project.createdAt);
    const isOverdue = daysInStage > 15 && project.status === 'Active'; // Alert threshold

    return (
        <div className={`glass-card project-card ${project.status !== 'Active' ? 'status-' + project.status.toLowerCase().replace(' ', '-') : ''}`}>

            <div className="card-header">
                <div className={`type-badge ${isRD ? 'rd' : 'service'}`}>
                    {isRD ? <FlaskConical size={12} /> : <Briefcase size={12} />}
                    <span>{isRD ? 'R&D Project' : 'I+D Service'}</span>
                </div>
                <div className="card-actions">
                    <button className="icon-btn-small view" onClick={() => onView(project)} title="Ver detalles">
                        <Eye size={16} />
                    </button>
                    {project.status === 'Active' && (
                        <>
                            <button className="icon-btn-small edit" onClick={() => setIsEditingStage(true)} title="Cambiar etapa">
                                <Edit3 size={16} />
                            </button>
                            <button className="icon-btn-small close-opp" onClick={() => onCloseClick(project)} title="Cerrar oportunidad">
                                <DoorClosed size={16} />
                            </button>
                        </>
                    )}
                    <button className="icon-btn-small delete" onClick={() => onDelete(project.id)} title="Eliminar proyecto">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="card-body">
                <div className="card-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4>{project.name}</h4>
                        <div className={`amount-indicator ${project.amount > 0 ? 'active' : 'inactive'}`} title={project.amount > 0 ? `Monto: CLP ${project.amount}` : 'Sin monto'}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    {project.status === 'Closed Won' && <Trophy size={18} className="win-icon" />}
                    {project.status === 'Closed Lost' && <Frown size={18} className="lost-icon" />}
                </div>
                <p className="client-name">{project.client}</p>

                <div className="industry-tag">
                    <Layers size={12} />
                    <span>{project.sector}</span>
                </div>

                {project.status !== 'Active' && project.closureReason && (
                    <div className="closure-info">
                        <div className="closure-head">
                            <MessageSquare size={12} />
                            <span>{project.status === 'Closed Won' ? 'Motivo Éxito' : 'Motivo Cierre'}</span>
                        </div>
                        <span className="reason-text">"{project.closureReason}"</span>
                    </div>
                )}
            </div>

            <div className="card-footer">
                <div className="progress-container">
                    <div className="progress-info">
                        {isEditingStage ? (
                            <div className="stage-edit-row">
                                <select
                                    value={selectedStage}
                                    onChange={(e) => setSelectedStage(e.target.value)}
                                    className="stage-select"
                                >
                                    {STAGES.map(stage => (
                                        <option key={stage} value={stage}>{stage} ({STAGE_PROGRESS[stage]}%)</option>
                                    ))}
                                </select>
                                <button className="icon-btn-mini confirm" onClick={handleSaveStage}><Check size={14} /></button>
                                <button className="icon-btn-mini cancel" onClick={handleCancelEdit}><X size={14} /></button>
                            </div>
                        ) : (
                            <>
                                <span className="stage">{project.stage}</span>
                                <span className="percent">{progress}%</span>
                            </>
                        )}
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${isRD ? 'grad-orange-pink' : 'grad-blue-purple'}`}
                            style={{
                                width: `${progress}%`,
                                opacity: project.status === 'Active' ? 1 : 0.4,
                                filter: project.status === 'Closed Lost' ? 'grayscale(1)' : 'none'
                            }}
                        ></div>
                    </div>
                </div>

                <div className="time-metrics">
                    <div className="metric-item" title="Tiempo total desde creación">
                        <Clock size={12} />
                        <span>{daysSinceCreation}d total</span>
                    </div>
                    <div className={`metric-item ${isOverdue ? 'alert' : ''}`} title="Tiempo en la etapa actual">
                        {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                        <span>{daysInStage}d en etapa</span>
                    </div>
                </div>

                {project.taxBenefit && (
                    <div className="tax-badge" style={{ marginTop: '8px' }}>Ley I+D</div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
