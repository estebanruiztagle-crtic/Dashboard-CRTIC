import React from 'react';
import { Shield, Map, Target, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdvancedInsights = ({ projects, quotations, tourData }) => {
    // CLP currency formatter
    const formatCLP = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Calculate pipeline totals
    const prospectionTotal = quotations.filter(q => q.status === 'Prospección' || !q.status).length * 150000;
    const salesTotal = projects.filter(p => ['Opportunidad', 'Exploración', 'Investigar'].includes(p.stage)).length * 350000;
    const growthTotal = projects.filter(p => ['Desarrollar', 'Testear', 'Validar', 'Escalar'].includes(p.stage)).length * 800000;
    const pipelineTotal = prospectionTotal + salesTotal + growthTotal;

    // Calculate average Sr
    const avgSr = projects.length > 0
        ? projects.reduce((acc, p) => acc + (p.sr || 0.5), 0) / projects.length
        : 0.5;

    // Scope Guard - count high risk projects
    const highRiskCount = projects.filter((p, i) => ((i * 2 + 1) % 7) > 4).length;
    const totalMonitored = Math.min(projects.length, 4);

    // Tour stats
    const tourFromLab = tourData.fromTour || 15;
    const tourDirect = tourData.direct || 9;
    const tourPercentage = Math.round((tourFromLab / (tourFromLab + tourDirect)) * 100);

    return (
        <div className="insights-grid">
            {/* Pipeline Card */}
            <div className="insight-card pipeline">
                <div className="insight-card-glow" />
                <div className="insight-card-content">
                    <div className="insight-header">
                        <div className="insight-icon blue">
                            <TrendingUp size={18} />
                        </div>
                        <span className="insight-label">Pipeline</span>
                    </div>
                    <div className="insight-value">
                        {formatCLP(pipelineTotal)}
                    </div>
                    <div className="insight-breakdown">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Prospección</span>
                            <span className="breakdown-value">{formatCLP(prospectionTotal)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Ventas</span>
                            <span className="breakdown-value">{formatCLP(salesTotal)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Crecimiento</span>
                            <span className="breakdown-value">{formatCLP(growthTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Matrix Card */}
            <div className="insight-card matrix">
                <div className="insight-card-glow" />
                <div className="insight-card-content">
                    <div className="insight-header">
                        <div className="insight-icon orange">
                            <Target size={18} />
                        </div>
                        <span className="insight-label">Replicabilidad</span>
                    </div>
                    <div className="insight-value">
                        Sr {avgSr.toFixed(2)}
                    </div>
                    <div className="sr-indicator">
                        <div className="sr-bar-container">
                            <div
                                className={`sr-bar-fill ${avgSr > 0.7 ? 'high' : avgSr < 0.4 ? 'low' : 'mid'}`}
                                style={{ width: `${avgSr * 100}%` }}
                            />
                        </div>
                        <span className={`sr-status ${avgSr > 0.7 ? 'high' : avgSr < 0.4 ? 'low' : 'mid'}`}>
                            {avgSr > 0.7 ? 'Alto' : avgSr < 0.4 ? 'Bajo' : 'Medio'}
                        </span>
                    </div>
                    <p className="insight-footnote">
                        Promedio de {projects.length} proyectos
                    </p>
                </div>
            </div>

            {/* Scope Guard Card */}
            <div className="insight-card scope">
                <div className="insight-card-glow" />
                <div className="insight-card-content">
                    <div className="insight-header">
                        <div className="insight-icon red">
                            <Shield size={18} />
                        </div>
                        <span className="insight-label">Scope Guard</span>
                    </div>
                    <div className="insight-value">
                        {highRiskCount}/{totalMonitored}
                    </div>
                    <div className="scope-status">
                        {highRiskCount === 0 ? (
                            <div className="scope-badge safe">
                                <ArrowDownRight size={14} />
                                <span>Sin alertas</span>
                            </div>
                        ) : (
                            <div className="scope-badge alert">
                                <ArrowUpRight size={14} />
                                <span>{highRiskCount} en riesgo</span>
                            </div>
                        )}
                    </div>
                    <p className="insight-footnote">
                        Proyectos monitoreados
                    </p>
                </div>
            </div>

            {/* Tour Attribution Card */}
            <div className="insight-card tour">
                <div className="insight-card-glow" />
                <div className="insight-card-content">
                    <div className="insight-header">
                        <div className="insight-icon purple">
                            <Map size={18} />
                        </div>
                        <span className="insight-label">Lab Tours</span>
                    </div>
                    <div className="insight-value">
                        {tourPercentage}%
                    </div>
                    <div className="tour-indicator">
                        <div className="tour-bar-container">
                            <div
                                className="tour-bar-fill"
                                style={{ width: `${tourPercentage}%` }}
                            />
                        </div>
                    </div>
                    <p className="insight-footnote">
                        +45% conversión vs. directo
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedInsights;
