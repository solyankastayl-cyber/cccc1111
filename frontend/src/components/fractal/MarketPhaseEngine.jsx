/**
 * MARKET PHASE ENGINE — Full-width with Tooltips
 * 
 * При наведении показывает пояснения что значит каждый элемент
 */

import React, { useEffect, useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Phase colors
const PHASE_COLORS = {
  ACCUMULATION: '#22c55e',
  MARKUP: '#3b82f6',
  DISTRIBUTION: '#f59e0b',
  MARKDOWN: '#ec4899',
  RECOVERY: '#06b6d4',
  CAPITULATION: '#ef4444',
};

// Phase descriptions for tooltips
const PHASE_TOOLTIPS = {
  ACCUMULATION: 'Фаза накопления — крупные игроки накапливают позиции. Обычно происходит после длительного падения. Боковое движение с низкой волатильностью.',
  MARKUP: 'Фаза роста — активный восходящий тренд. Цена растёт на высоких объёмах, рынок оптимистичен.',
  DISTRIBUTION: 'Фаза распределения — крупные игроки фиксируют прибыль. Происходит на вершине рынка перед разворотом.',
  MARKDOWN: 'Фаза снижения — активный нисходящий тренд. Цена падает, паника на рынке.',
  RECOVERY: 'Фаза восстановления — рынок начинает восстанавливаться после падения. Первые признаки разворота тренда.',
  CAPITULATION: 'Капитуляция — массовая паника и распродажи. Крайняя точка страха на рынке, часто дно цикла.',
};

// Column header tooltips
const HEADER_TOOLTIPS = {
  successRate: 'Success Rate — процент случаев, когда цена росла в данной фазе за исторический период. Выше 50% = фаза чаще приносила прибыль.',
  avgReturn: 'Average Return — средняя доходность за период нахождения в данной фазе. Положительное значение = рост цены.',
  riskLevel: 'Risk Level — уровень риска фазы на основе волатильности и исторических просадок. Low = стабильная фаза, High = высокая неопределённость.',
  horizon: 'Horizon — временной горизонт анализа. Показывает какой период влияет на текущий прогноз.',
  influence: 'Influence — вес данного горизонта в итоговом прогнозе. Чем выше процент, тем больше этот период влияет на рекомендацию.',
};

// Risk level
const getRisk = (avgRet, hitRate) => {
  if (hitRate > 0.55 && avgRet > 0.02) return { label: 'Low', color: '#16a34a', bg: '#dcfce7' };
  if (hitRate > 0.45 && avgRet > 0) return { label: 'Medium', color: '#d97706', bg: '#fef3c7' };
  return { label: 'High', color: '#dc2626', bg: '#fee2e2' };
};

// Risk tooltips
const RISK_TOOLTIPS = {
  Low: 'Низкий риск — фаза исторически стабильна, высокая вероятность положительного исхода.',
  Medium: 'Средний риск — умеренная неопределённость, результаты могут варьироваться.',
  High: 'Высокий риск — высокая волатильность и неопределённость, возможны значительные убытки.',
};

/**
 * Tooltip Component
 */
function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };
  
  return (
    <div 
      style={styles.tooltipWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={styles.tooltip}>
          <div style={styles.tooltipArrow} />
          <div style={styles.tooltipContent}>{text}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Phase Performance Column (Left ~55%)
 */
function PhaseColumn({ phases, loading, error }) {
  if (loading) {
    return <div style={styles.loading}>Loading phase data...</div>;
  }
  if (error) {
    return <div style={styles.error}>{error}</div>;
  }
  if (!phases?.length) {
    return <div style={styles.empty}>No data available</div>;
  }

  return (
    <div style={styles.phaseColumn}>
      <div style={styles.columnHeader}>Historical Phase Performance</div>
      <div style={styles.phaseTable}>
        {/* Header */}
        <div style={styles.phaseHeaderRow}>
          <span style={styles.phColPhase}>Phase</span>
          <Tooltip text={HEADER_TOOLTIPS.successRate}>
            <span style={styles.phColCenterHeader}>Success Rate</span>
          </Tooltip>
          <Tooltip text={HEADER_TOOLTIPS.avgReturn}>
            <span style={styles.phColCenterHeader}>Avg Return</span>
          </Tooltip>
          <Tooltip text={HEADER_TOOLTIPS.riskLevel}>
            <span style={styles.phColCenterHeader}>Risk Level</span>
          </Tooltip>
        </div>
        {/* Rows */}
        {phases.map((p) => {
          const risk = getRisk(p.avgRet, p.hitRate);
          const phaseColor = PHASE_COLORS[p.phaseName] || '#6b7280';
          const phaseTooltip = PHASE_TOOLTIPS[p.phaseName] || `Фаза ${p.phaseName}`;
          const riskTooltip = RISK_TOOLTIPS[risk.label] || '';
          
          return (
            <div key={p.phaseId || p.phaseName} style={styles.phaseRow}>
              <span style={styles.phColPhase}>
                <Tooltip text={phaseTooltip}>
                  <span style={{ ...styles.phaseBadge, backgroundColor: phaseColor }}>
                    {p.phaseName}
                  </span>
                </Tooltip>
              </span>
              <Tooltip text={`В фазе ${p.phaseName} цена росла в ${(p.hitRate * 100).toFixed(0)}% случаев из исторических данных.`}>
                <span style={{
                  ...styles.phColCenter,
                  ...styles.statValue,
                  color: p.hitRate > 0.5 ? '#16a34a' : '#dc2626',
                }}>
                  {(p.hitRate * 100).toFixed(0)}%
                </span>
              </Tooltip>
              <Tooltip text={`Средняя доходность в фазе ${p.phaseName}: ${p.avgRet >= 0 ? '+' : ''}${(p.avgRet * 100).toFixed(1)}% за период.`}>
                <span style={{
                  ...styles.phColCenter,
                  ...styles.statValue,
                  color: p.avgRet >= 0 ? '#16a34a' : '#dc2626',
                }}>
                  {p.avgRet >= 0 ? '+' : ''}{(p.avgRet * 100).toFixed(1)}%
                </span>
              </Tooltip>
              <span style={styles.phColCenter}>
                <Tooltip text={riskTooltip}>
                  <span style={{
                    ...styles.riskBadge,
                    backgroundColor: risk.bg,
                    color: risk.color,
                  }}>
                    {risk.label}
                  </span>
                </Tooltip>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Forecast Weighting Column (Right ~45%)
 */
function WeightColumn({ horizonStack }) {
  if (!horizonStack?.length) return null;

  // Sort by weight desc
  const sorted = [...horizonStack].sort((a, b) => (b.voteWeight || 0) - (a.voteWeight || 0));

  return (
    <div style={styles.weightColumn}>
      <Tooltip text="Показывает какие временные горизонты влияют на текущий прогноз и с каким весом. Адаптивная система автоматически подбирает оптимальные веса.">
        <div style={styles.columnHeader}>Current Forecast Influence</div>
      </Tooltip>
      <div style={styles.weightTable}>
        {sorted.map((item) => {
          const weight = (item.voteWeight || 0) * 100;
          const barColor = weight > 30 ? '#ef4444' : weight > 15 ? '#8b5cf6' : '#3b82f6';
          const horizonDays = parseInt(item.horizon) || item.horizon;
          
          return (
            <Tooltip 
              key={item.horizon} 
              text={`Горизонт ${item.horizon?.toUpperCase()} влияет на прогноз с весом ${weight.toFixed(0)}%. ${weight > 30 ? 'Это доминирующий горизонт.' : weight > 15 ? 'Значительное влияние.' : 'Минимальное влияние.'}`}
            >
              <div style={styles.weightRow}>
                <span style={styles.horizonLabel}>{item.horizon?.toUpperCase()}</span>
                <div style={styles.barContainer}>
                  <div style={styles.barBg}>
                    <div style={{
                      ...styles.bar,
                      width: `${Math.min(100, weight * 2.5)}%`,
                      backgroundColor: barColor,
                    }} />
                  </div>
                </div>
                <span style={styles.weightPercent}>{weight.toFixed(0)}%</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main Component
 */
export function MarketPhaseEngine({ tier = 'TACTICAL', horizonStack }) {
  const [phases, setPhases] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/fractal/v2.1/admin/phase-performance?symbol=BTC&tier=${tier}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setPhases(data.phases || []);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tier]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div style={styles.container} data-testid="market-phase-engine">
      <Tooltip text="Market Phase Engine анализирует текущую рыночную фазу и показывает как исторически вели себя цены в похожих условиях.">
        <div style={styles.header}>
          <span style={styles.title}>Market Phase Engine</span>
        </div>
      </Tooltip>
      <div style={styles.content}>
        <PhaseColumn phases={phases} loading={loading} error={error} />
        <div style={styles.divider} />
        <WeightColumn horizonStack={horizonStack} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    cursor: 'help',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    letterSpacing: '-0.01em',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    padding: '20px 24px',
  },
  
  // Phase Column (55%)
  phaseColumn: {
    flex: '1 1 55%',
    paddingRight: '24px',
  },
  columnHeader: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '16px',
    letterSpacing: '0.02em',
    cursor: 'help',
  },
  phaseTable: {
    display: 'flex',
    flexDirection: 'column',
  },
  phaseHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 1fr 100px',
    gap: '16px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '12px',
    fontWeight: '500',
    color: '#9ca3af',
  },
  phaseRow: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 1fr 100px',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
    alignItems: 'center',
  },
  phColPhase: {
    display: 'flex',
    alignItems: 'center',
  },
  phColCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'help',
  },
  phColCenterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'help',
    borderBottom: '1px dashed #d1d5db',
    paddingBottom: '2px',
  },
  phaseBadge: {
    color: '#ffffff',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    cursor: 'help',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '-0.01em',
  },
  riskBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'help',
  },
  
  // Divider
  divider: {
    width: '1px',
    backgroundColor: '#e5e7eb',
    margin: '0',
    alignSelf: 'stretch',
  },
  
  // Weight Column (45%)
  weightColumn: {
    flex: '1 1 45%',
    paddingLeft: '24px',
  },
  weightTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  weightRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'help',
    padding: '4px 0',
    borderRadius: '4px',
    transition: 'background-color 0.15s',
  },
  horizonLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    minWidth: '40px',
    letterSpacing: '0.02em',
  },
  barContainer: {
    flex: 1,
  },
  barBg: {
    height: '10px',
    backgroundColor: '#f3f4f6',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  weightPercent: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    minWidth: '40px',
    textAlign: 'right',
    letterSpacing: '-0.01em',
  },
  
  // Tooltip
  tooltipWrapper: {
    position: 'relative',
    display: 'inline-flex',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #1f2937',
  },
  tooltipContent: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.5',
    maxWidth: '280px',
    minWidth: '200px',
    textAlign: 'left',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontWeight: '400',
  },
  
  // States
  loading: {
    fontSize: '14px',
    color: '#9ca3af',
    padding: '24px 0',
  },
  error: {
    fontSize: '14px',
    color: '#dc2626',
    padding: '24px 0',
  },
  empty: {
    fontSize: '14px',
    color: '#9ca3af',
    padding: '24px 0',
  },
};

export default MarketPhaseEngine;
