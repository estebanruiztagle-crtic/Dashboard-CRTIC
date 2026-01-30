import React, { useState } from 'react';
import { Brain, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const AIBrain = ({ onProjectExtracted }) => {
    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

    const calculateSr = (text) => {
        const boostKeywords = [
            'ia gen', 'audio', 'video', 'voz', 'música', 'lmm', 'gpt', 'stable diffusion',
            'automatización', 'n8n', 'antigravity', 'zapier',
            'xr', 'vr', 'ar', '360', 'gaussian', 'splats',
            'visual coding', 'touch designer', 'vvvv', 'cables.gl',
            'cgi', 'unreal', 'unity', 'mocap', 'blender',
            'sonido', 'dolby atmos', 'spatial', 'ambisonics'
        ];

        const penaltyKeywords = [
            'robótica', 'sensores', 'impresión 3d', 'hardware', 'electrónica', 'pcb', 'sensores'
        ];

        let score = 0.5;
        const lowerText = text.toLowerCase();

        boostKeywords.forEach(kw => {
            if (lowerText.includes(kw)) score += 0.1;
        });

        penaltyKeywords.forEach(kw => {
            if (lowerText.includes(kw)) score -= 0.15;
        });

        return Math.max(0, Math.min(1, score));
    };

    const processText = () => {
        if (!input.trim()) return;

        setProcessing(true);

        // Simulate AI extraction logic
        setTimeout(() => {
            const sr = calculateSr(input);

            // Basic extraction via regex or simple logic
            const sectors = ['Minería', 'Retail', 'Música', 'Salud', 'Logística', 'Educación', 'Gobierno', 'Deportes', 'Industrias Creativas', 'Patrimonio', 'Automotriz'];
            const foundSector = sectors.find(s => input.toLowerCase().includes(s.toLowerCase())) || 'Tech/Otros';

            const amountMatch = input.match(/\$?\s?(\d+([.,]\d+)*)/);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.')) : 50000;

            const clientMatch = input.match(/cliente:?\s*([A-Za-z0-9\s]+)/i);
            const client = clientMatch ? clientMatch[1].trim() : 'Cliente Potencial';

            const status = input.toLowerCase().includes('cerrado') ? 'Venta' :
                input.toLowerCase().includes('propuesta') ? 'Prospección' : 'Oportunidad';

            const extracted = {
                name: `Proyecto ${foundSector} AI`,
                client,
                sector: foundSector,
                amount,
                sr,
                status,
                description: input.substring(0, 100) + '...'
            };

            setResult(extracted);
            setProcessing(false);
        }, 1500);
    };

    const handleConfirm = () => {
        onProjectExtracted(result);
        setResult(null);
        setInput('');
    };

    return (
        <div className="ai-brain-form">
            {processing && (
                <div className="ai-processing-indicator">
                    <Sparkles className="spin" size={16} />
                    <span>Analizando minuta con IA...</span>
                </div>
            )}

            <div className="form-group">
                <label>Pega la minuta o notas de reunión</label>
                <textarea
                    rows="5"
                    placeholder="Ej: Reunión con Cliente X del sector Minería. Se discutió proyecto de automatización con N8N y visión artificial. Presupuesto estimado: $150.000..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>

            <div className="form-actions">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                        setInput('');
                        setResult(null);
                    }}
                >
                    Limpiar
                </button>
                <button
                    type="button"
                    className="btn-primary"
                    onClick={processText}
                    disabled={processing || !input.trim()}
                >
                    {processing ? 'Procesando...' : 'Analizar con IA'}
                </button>
            </div>

            {result && (
                <div className="ai-result-section">
                    <div className="ai-result-header">
                        <Sparkles size={16} />
                        <span>Datos Extraídos</span>
                    </div>

                    <div className="ai-result-grid">
                        <div className="form-group">
                            <label>Cliente Detectado</label>
                            <input type="text" value={result.client} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Sector</label>
                            <input type="text" value={result.sector} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Monto Estimado</label>
                            <input type="text" value={`$${result.amount.toLocaleString('es-CL')}`} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Score Replicabilidad (Sr)</label>
                            <div className="sr-score-display">
                                <span className={`sr-value ${result.sr > 0.7 ? 'high' : result.sr < 0.4 ? 'low' : 'mid'}`}>
                                    {result.sr.toFixed(2)}
                                </span>
                                <div className="sr-bar">
                                    <div
                                        className={`sr-fill ${result.sr > 0.7 ? 'high' : result.sr < 0.4 ? 'low' : 'mid'}`}
                                        style={{ width: `${result.sr * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setResult(null)}
                        >
                            Descartar
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleConfirm}
                        >
                            <CheckCircle2 size={16} />
                            Confirmar e Integrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIBrain;
