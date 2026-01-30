import React, { useState } from 'react';
import { Layers, FlaskConical, Briefcase, Trash2, Edit3, Check, X, Eye } from 'lucide-react';

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

const ProjectCard = ({ project, onDelete, onUpdateStage, onView }) => {
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

    return (
        <div className="glass-card project-card">
            <div className="card-header">
                <div className={`type-badge ${isRD ? 'rd' : 'service'}`}>
                    {isRD ? <FlaskConical size={12} /> : <Briefcase size={12} />}
                    <span>{isRD ? 'R&D Project' : 'I+D Service'}</span>
                </div>
                <div className="card-actions">
                    <button className="icon-btn-small view" onClick={() => onView(project)} title="Ver detalles">
                        <Eye size={16} />
                    </button>
                    <button className="icon-btn-small edit" onClick={() => setIsEditingStage(true)} title="Cambiar etapa">
                        <Edit3 size={16} />
                    </button>
                    <button className="icon-btn-small delete" onClick={() => onDelete(project.id)} title="Eliminar proyecto">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="card-body">
                <h4>{project.name}</h4>
                <p className="client-name">{project.client}</p>

                <div className="industry-tag">
                    <Layers size={12} />
                    <span>{project.sector}</span>
                </div>
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
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {project.taxBenefit && (
                    <div className="tax-badge">Ley I+D</div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
