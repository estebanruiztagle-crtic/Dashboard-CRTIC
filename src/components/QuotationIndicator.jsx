import React, { useState, useMemo } from 'react';
import { DollarSign, FileText, ChevronDown, Filter, Plus } from 'lucide-react';
import Modal from './Modal';

const QuotationIndicator = ({ quotations, industries, onAddQuotation, projectClients = [] }) => {
    const [period, setPeriod] = useState('monthly'); // 'monthly', 'quarterly', 'annual'
    const [selectedSector, setSelectedSector] = useState('All');
    const [selectedClient, setSelectedClient] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newQuotation, setNewQuotation] = useState({
        client: projectClients[0] || '', sector: industries[0] || 'Extractiva', amount: '', date: new Date().toISOString().split('T')[0]
    });

    const clients = useMemo(() => {
        const uniqueClients = [...new Set(quotations.map(q => q.client))];
        return ['All', ...uniqueClients];
    }, [quotations]);

    const filteredQuotations = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);

        return quotations.filter(q => {
            const qDate = new Date(q.date);
            const qYear = qDate.getFullYear();
            const qMonth = qDate.getMonth();
            const qQuarter = Math.floor(qMonth / 3);

            // Period Filter
            let timeMatch = false;
            if (period === 'annual') {
                timeMatch = qYear === currentYear;
            } else if (period === 'quarterly') {
                timeMatch = qYear === currentYear && qQuarter === currentQuarter;
            } else if (period === 'monthly') {
                timeMatch = qYear === currentYear && qMonth === currentMonth;
            }

            // Sector Filter
            const sectorMatch = selectedSector === 'All' || q.sector === selectedSector;

            // Client Filter
            const clientMatch = selectedClient === 'All' || q.client === selectedClient;

            return timeMatch && sectorMatch && clientMatch;
        });
    }, [quotations, period, selectedSector, selectedClient]);

    const handleAdd = (e) => {
        e.preventDefault();
        onAddQuotation({
            ...newQuotation,
            id: Date.now(),
            amount: parseFloat(newQuotation.amount) || 0
        });
        setIsModalOpen(false);
        setNewQuotation({ client: projectClients[0] || '', sector: industries[0] || 'Extractiva', amount: '', date: new Date().toISOString().split('T')[0] });
    };

    const totalAmount = filteredQuotations.reduce((sum, q) => sum + q.amount, 0);
    const count = filteredQuotations.length;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="glass-card quotation-indicator">
            <div className="indicator-header">
                <div className="title-group">
                    <div className="icon-bg grad-orange-pink">
                        <FileText className="icon" size={18} />
                    </div>
                    <div className="title-text">
                        <h3>Indicador de Cotizaciones</h3>
                        <span className="subtitle">Resumen de propuestas comerciales</span>
                    </div>
                </div>
                <div className="header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="period-toggle">
                        <button
                            className={period === 'monthly' ? 'active' : ''}
                            onClick={() => setPeriod('monthly')}
                        >
                            Este Mes
                        </button>
                        <button
                            className={period === 'quarterly' ? 'active' : ''}
                            onClick={() => setPeriod('quarterly')}
                        >
                            Este Trimestre
                        </button>
                        <button
                            className={period === 'annual' ? 'active' : ''}
                            onClick={() => setPeriod('annual')}
                        >
                            Este Año
                        </button>
                    </div>
                    <button className="add-btn grad-blue-purple" style={{ padding: '8px 16px', borderRadius: '12px', height: 'auto', boxShadow: 'none' }} onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} />
                        <span>Nueva</span>
                    </button>
                </div>
            </div>

            <div className="indicator-filters">
                <div className="filter-item">
                    <label>Filtrar por Sector</label>
                    <div className="select-wrapper">
                        <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
                            <option value="All">Todos los Sectores</option>
                            {industries.map(industry => (
                                <option key={industry} value={industry}>{industry}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} />
                    </div>
                </div>
                <div className="filter-item">
                    <label>Filtrar por Cliente</label>
                    <div className="select-wrapper">
                        <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                            {clients.map(client => (
                                <option key={client} value={client}>{client === 'All' ? 'Todos los Clientes' : client}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} />
                    </div>
                </div>
            </div>

            <div className="indicator-stats">
                <div className="stat-box amount">
                    <span className="stat-label">Monto Acumulado</span>
                    <div className="stat-value-group">
                        <span className="stat-value">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>
                <div className="stat-box count">
                    <span className="stat-label">Cantidad de Cotizaciones</span>
                    <div className="stat-value-group">
                        <span className="stat-value">{count}</span>
                        <span className="stat-unit">propuestas</span>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Cotización">
                <form onSubmit={handleAdd}>
                    <div className="form-group">
                        <label>Cliente</label>
                        <select required value={newQuotation.client} onChange={e => setNewQuotation({ ...newQuotation, client: e.target.value })}>
                            <option value="" disabled>Seleccionar cliente...</option>
                            {projectClients.map(client => (
                                <option key={client} value={client}>{client}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Monto (CLP)</label>
                        <input required type="number" value={newQuotation.amount} onChange={e => setNewQuotation({ ...newQuotation, amount: e.target.value })} placeholder="1000000" />
                    </div>
                    <div className="form-group">
                        <label>Fecha</label>
                        <input required type="date" value={newQuotation.date} onChange={e => setNewQuotation({ ...newQuotation, date: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Guardar Cotización</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default QuotationIndicator;
