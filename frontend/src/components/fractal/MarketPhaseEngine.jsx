/**
 * MARKET PHASE ENGINE — Compact Horizontal Layout
 * 
 * Один компактный блок:
 * | Phase Performance (55%) | Forecast Weighting (45%) |
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

// Short phase names
const PHASE_SHORT = {
  ACCUMULATION: 'Accum',
  MARKUP: 'Markup',
  DISTRIBUTION: 'Distrib',
  MARKDOWN: 'Markdown',
  RECOVERY: 'Recovery',
  CAPITULATION: 'Capitul',
};

// Risk level
const getRisk = (avgRet, hitRate) => {
  if (hitRate > 0.55 && avgRet > 0.02) return { label: 'Low', color: '#16a34a' };
  if (hitRate > 0.45 && avgRet > 0) return { label: 'Med', color: '#d97706' };
  return { label: 'High', color: '#dc2626' };
};

/**
 * Phase Performance Column (Left 55%)
 */
function PhaseColumn({ phases, loading, error }) {
  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }
  if (error) {
    return <div style={styles.error}>{error}</div>;
  }
  if (!phases?.length) {
    return <div style={styles.empty}>No data</div>;
  }

  return (
    <div style={styles.phaseColumn}>
      <div style={styles.columnHeader}>Phase Performance</div>
      <div style={styles.phaseTable}>
        {/* Header */}
        <div style={styles.phaseHeaderRow}>
          <span style={styles.phaseColName}>Phase</span>
          <span style={styles.phaseColStat}>Success</span>
          <span style={styles.phaseColStat}>Return</span>
          <span style={styles.phaseColRisk}>Risk</span>
        </div>
        {/* Rows */}
        {phases.map((p) => {
          const risk = getRisk(p.avgRet, p.hitRate);
          const phaseColor = PHASE_COLORS[p.phaseName] || '#6b7280';
          const shortName = PHASE_SHORT[p.phaseName] || p.phaseName;
          
          return (
            <div key={p.phaseId || p.phaseName} style={styles.phaseRow}>
              <span style={styles.phaseColName}>
                <span style={{ ...styles.phaseBadge, backgroundColor: phaseColor }}>
                  {shortName}
                </span>
              </span>
              <span style={{
                ...styles.phaseColStat,
                color: p.hitRate > 0.5 ? '#16a34a' : '#dc2626',
              }}>
                {(p.hitRate * 100).toFixed(0)}%
              </span>
              <span style={{
                ...styles.phaseColStat,
                color: p.avgRet >= 0 ? '#16a34a' : '#dc2626',
              }}>
                {p.avgRet >= 0 ? '+' : ''}{(p.avgRet * 100).toFixed(1)}%
              </span>
              <span style={{ ...styles.phaseColRisk, color: risk.color }}>
                {risk.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Forecast Weighting Column (Right 45%)
 */
function WeightColumn({ horizonStack }) {
  if (!horizonStack?.length) return null;

  // Sort by weight desc
  const sorted = [...horizonStack].sort((a, b) => (b.voteWeight || 0) - (a.voteWeight || 0));

  return (
    <div style={styles.weightColumn}>
      <div style={styles.columnHeader}>Forecast Weighting</div>
      <div style={styles.weightTable}>
        {sorted.map((item) => {
          const weight = (item.voteWeight || 0) * 100;
          const barColor = weight > 30 ? '#ef4444' : weight > 15 ? '#8b5cf6' : '#3b82f6';
          
          return (
            <div key={item.horizon} style={styles.weightRow}>
              <span style={styles.horizonLabel}>{item.horizon?.toUpperCase()}</span>
              <div style={styles.miniBarContainer}>
                <div style={{
                  ...styles.miniBar,
                  width: `${Math.min(100, weight * 2.5)}%`,
                  backgroundColor: barColor,
                }} />
              </div>
              <span style={styles.weightPercent}>{weight.toFixed(0)}%</span>
            </div>
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
      <div style={styles.header}>
        <span style={styles.title}>Market Phase Engine</span>
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
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  header: {
    padding: '10px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    padding: '12px 16px',
    gap: '0',
  },
  
  // Phase Column (55%)
  phaseColumn: {
    flex: '0 0 55%',
    paddingRight: '16px',
  },
  columnHeader: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  phaseTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  phaseHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '80px 55px 55px 40px',
    gap: '4px',
    paddingBottom: '4px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '9px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  phaseRow: {
    display: 'grid',
    gridTemplateColumns: '80px 55px 55px 40px',
    gap: '4px',
    padding: '5px 0',
    borderBottom: '1px solid #f9fafb',
    alignItems: 'center',
  },
  phaseColName: {
    display: 'flex',
    alignItems: 'center',
  },
  phaseColStat: {
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'ui-monospace, monospace',
    textAlign: 'center',
  },
  phaseColRisk: {
    fontSize: '10px',
    fontWeight: '600',
    textAlign: 'center',
  },
  phaseBadge: {
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '0.2px',
  },
  
  // Divider
  divider: {
    width: '1px',
    backgroundColor: '#e5e7eb',
    margin: '0 16px',
  },
  
  // Weight Column (45%)
  weightColumn: {
    flex: '0 0 calc(45% - 33px)',
  },
  weightTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  weightRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '3px 0',
  },
  horizonLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#374151',
    fontFamily: 'ui-monospace, monospace',
    minWidth: '32px',
  },
  miniBarContainer: {
    flex: 1,
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  miniBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.2s',
  },
  weightPercent: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'ui-monospace, monospace',
    minWidth: '28px',
    textAlign: 'right',
  },
  
  // States
  loading: {
    fontSize: '11px',
    color: '#9ca3af',
    padding: '12px 0',
  },
  error: {
    fontSize: '11px',
    color: '#dc2626',
    padding: '12px 0',
  },
  empty: {
    fontSize: '11px',
    color: '#9ca3af',
    padding: '12px 0',
  },
};

export default MarketPhaseEngine;
