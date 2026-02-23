/**
 * MARKET PHASE ENGINE — Full-width with Tooltips (English)
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

// Phase descriptions - ENGLISH
const PHASE_TOOLTIPS = {
  ACCUMULATION: 'Accumulation phase — smart money builds positions. Usually after prolonged decline.',
  MARKUP: 'Markup phase — active uptrend. Price rises on high volume, market is bullish.',
  DISTRIBUTION: 'Distribution phase — smart money takes profits at market top before reversal.',
  MARKDOWN: 'Markdown phase — active downtrend. Price falls, market panic.',
  RECOVERY: 'Recovery phase — market starts recovering after decline. Early reversal signs.',
  CAPITULATION: 'Capitulation — mass panic and selling. Often marks the cycle bottom.',
};

// Column header tooltips - ENGLISH
const HEADER_TOOLTIPS = {
  successRate: 'Percentage of times price increased during this phase historically. Above 50% = profitable more often.',
  avgReturn: 'Average return during this phase period. Positive = price growth.',
  riskLevel: 'Risk level based on volatility and historical drawdowns.',
};

// Risk level
const getRisk = (avgRet, hitRate) => {
  if (hitRate > 0.55 && avgRet > 0.02) return { label: 'Low', color: '#16a34a', bg: '#dcfce7' };
  if (hitRate > 0.45 && avgRet > 0) return { label: 'Medium', color: '#d97706', bg: '#fef3c7' };
  return { label: 'High', color: '#dc2626', bg: '#fee2e2' };
};

// Risk tooltips - ENGLISH
const RISK_TOOLTIPS = {
  Low: 'Low risk — stable phase, high probability of positive outcome.',
  Medium: 'Medium risk — moderate uncertainty, results may vary.',
  High: 'High risk — high volatility and uncertainty, significant losses possible.',
};

/**
 * Tooltip Component - positioned near element
 */
function Tip({ children, text }) {
  const [show, setShow] = useState(false);
  
  return (
    <span 
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span style={{
          position: 'absolute',
          bottom: 'calc(100% + 6px)',
          left: '0',
          zIndex: 1000,
          backgroundColor: '#1f2937',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: '1.4',
          width: '220px',
          textAlign: 'left',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: '400',
          whiteSpace: 'normal',
        }}>
          {text}
          <span style={{
            position: 'absolute',
            bottom: '-5px',
            left: '16px',
            width: '0',
            height: '0',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #1f2937',
          }} />
        </span>
      )}
    </span>
  );
}

/**
 * Phase Performance Column
 */
function PhaseColumn({ phases, loading, error }) {
  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!phases?.length) return <div style={styles.empty}>No data</div>;

  return (
    <div style={styles.phaseColumn}>
      <div style={styles.columnHeader}>Historical Phase Performance</div>
      <div style={styles.phaseTable}>
        <div style={styles.phaseHeaderRow}>
          <span style={styles.phColPhase}>Phase</span>
          <Tip text={HEADER_TOOLTIPS.successRate}>
            <span style={styles.headerWithTip}>Success Rate</span>
          </Tip>
          <Tip text={HEADER_TOOLTIPS.avgReturn}>
            <span style={styles.headerWithTip}>Avg Return</span>
          </Tip>
          <Tip text={HEADER_TOOLTIPS.riskLevel}>
            <span style={styles.headerWithTip}>Risk Level</span>
          </Tip>
        </div>
        {phases.map((p) => {
          const risk = getRisk(p.avgRet, p.hitRate);
          const phaseColor = PHASE_COLORS[p.phaseName] || '#6b7280';
          
          return (
            <div key={p.phaseId || p.phaseName} style={styles.phaseRow}>
              <span style={styles.phColPhase}>
                <Tip text={PHASE_TOOLTIPS[p.phaseName]}>
                  <span style={{ ...styles.phaseBadge, backgroundColor: phaseColor }}>
                    {p.phaseName}
                  </span>
                </Tip>
              </span>
              <span style={styles.phColCenter}>
                <Tip text={`Price increased ${(p.hitRate * 100).toFixed(0)}% of the time in ${p.phaseName} phase.`}>
                  <span style={{
                    ...styles.statValue,
                    color: p.hitRate > 0.5 ? '#16a34a' : '#dc2626',
                  }}>
                    {(p.hitRate * 100).toFixed(0)}%
                  </span>
                </Tip>
              </span>
              <span style={styles.phColCenter}>
                <Tip text={`Average return: ${p.avgRet >= 0 ? '+' : ''}${(p.avgRet * 100).toFixed(1)}% per period.`}>
                  <span style={{
                    ...styles.statValue,
                    color: p.avgRet >= 0 ? '#16a34a' : '#dc2626',
                  }}>
                    {p.avgRet >= 0 ? '+' : ''}{(p.avgRet * 100).toFixed(1)}%
                  </span>
                </Tip>
              </span>
              <span style={styles.phColCenter}>
                <Tip text={RISK_TOOLTIPS[risk.label]}>
                  <span style={{
                    ...styles.riskBadge,
                    backgroundColor: risk.bg,
                    color: risk.color,
                  }}>
                    {risk.label}
                  </span>
                </Tip>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Forecast Weighting Column
 */
function WeightColumn({ horizonStack }) {
  if (!horizonStack?.length) return null;
  const sorted = [...horizonStack].sort((a, b) => (b.voteWeight || 0) - (a.voteWeight || 0));

  return (
    <div style={styles.weightColumn}>
      <Tip text="Shows which time horizons influence the current forecast and their weights.">
        <div style={styles.columnHeader}>Current Forecast Influence</div>
      </Tip>
      <div style={styles.weightTable}>
        {sorted.map((item) => {
          const weight = (item.voteWeight || 0) * 100;
          const barColor = weight > 30 ? '#ef4444' : weight > 15 ? '#8b5cf6' : '#3b82f6';
          const tip = `${item.horizon?.toUpperCase()} horizon contributes ${weight.toFixed(0)}% to forecast. ${weight > 30 ? 'Dominant.' : weight > 15 ? 'Significant.' : 'Minor influence.'}`;
          
          return (
            <Tip key={item.horizon} text={tip}>
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
            </Tip>
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
  
  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div style={styles.container} data-testid="market-phase-engine">
      <div style={styles.header}>
        <Tip text="Analyzes current market phase and shows historical price behavior in similar conditions.">
          <span style={styles.title}>Market Phase Engine</span>
        </Tip>
      </div>
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
    overflow: 'visible',
    width: '100%',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    cursor: 'help',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    padding: '20px 24px',
  },
  
  // Phase Column
  phaseColumn: {
    flex: '1 1 55%',
    paddingRight: '24px',
  },
  columnHeader: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '16px',
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
  headerWithTip: {
    borderBottom: '1px dashed #d1d5db',
    paddingBottom: '1px',
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
  },
  phaseBadge: {
    color: '#ffffff',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
  },
  riskBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  
  // Divider
  divider: {
    width: '1px',
    backgroundColor: '#e5e7eb',
    alignSelf: 'stretch',
  },
  
  // Weight Column
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
  },
  horizonLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    minWidth: '40px',
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
  },
  
  // States
  loading: { fontSize: '14px', color: '#9ca3af', padding: '24px 0' },
  error: { fontSize: '14px', color: '#dc2626', padding: '24px 0' },
  empty: { fontSize: '14px', color: '#9ca3af', padding: '24px 0' },
};

export default MarketPhaseEngine;
