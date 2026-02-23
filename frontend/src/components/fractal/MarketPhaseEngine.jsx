/**
 * MARKET PHASE ENGINE
 * 
 * Объединённый блок:
 * - Section 1: Historical Phase Performance (упрощённая таблица фаз)
 * - Section 2: Current Forecast Weighting (упрощённая таблица горизонтов)
 * 
 * Без технического мусора:
 * - Без Sharpe, Score, Samples, Grade A/B/C/F, Filter кнопок
 * - Без Tactical/Structure, Conf, Div, Matches, стрелок
 */

import React, { useEffect, useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Phase colors (matching chart)
const PHASE_COLORS = {
  ACCUMULATION: '#22c55e',
  MARKUP: '#3b82f6',
  DISTRIBUTION: '#f59e0b',
  MARKDOWN: '#ec4899',
  RECOVERY: '#06b6d4',
  CAPITULATION: '#ef4444',
};

// Risk levels based on historical data
const getRiskLevel = (avgRet, hitRate) => {
  if (hitRate > 0.55 && avgRet > 0.02) return { label: 'Low', color: '#16a34a', bg: '#dcfce7' };
  if (hitRate > 0.45 && avgRet > 0) return { label: 'Medium', color: '#d97706', bg: '#fef3c7' };
  return { label: 'High', color: '#dc2626', bg: '#fee2e2' };
};

/**
 * Section 1: Historical Phase Performance
 */
function PhasePerformanceSection({ phases, loading, error }) {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading phase data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  if (!phases || phases.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyText}>No phase data available</div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>Historical Phase Performance</span>
      </div>
      
      {/* Table Header */}
      <div style={styles.tableHeader}>
        <span style={styles.colPhase}>Phase</span>
        <span style={styles.colSuccess}>Historical Success</span>
        <span style={styles.colReturn}>Avg Return</span>
        <span style={styles.colRisk}>Risk</span>
      </div>
      
      {/* Table Rows */}
      {phases.map((phase) => {
        const risk = getRiskLevel(phase.avgRet, phase.hitRate);
        const phaseColor = PHASE_COLORS[phase.phaseName] || '#6b7280';
        
        return (
          <div 
            key={phase.phaseId || phase.phaseName} 
            style={styles.tableRow}
            data-testid={`phase-engine-row-${phase.phaseName?.toLowerCase()}`}
          >
            {/* Phase Name */}
            <span style={styles.colPhase}>
              <span style={{
                ...styles.phaseBadge,
                backgroundColor: phaseColor,
              }}>
                {phase.phaseName}
              </span>
            </span>
            
            {/* Historical Success */}
            <span style={styles.colSuccess}>
              <span style={{
                ...styles.successValue,
                color: phase.hitRate > 0.5 ? '#16a34a' : '#dc2626',
              }}>
                {(phase.hitRate * 100).toFixed(0)}%
              </span>
            </span>
            
            {/* Avg Return */}
            <span style={styles.colReturn}>
              <span style={{
                ...styles.returnValue,
                color: phase.avgRet >= 0 ? '#16a34a' : '#dc2626',
              }}>
                {phase.avgRet >= 0 ? '+' : ''}{(phase.avgRet * 100).toFixed(1)}%
              </span>
            </span>
            
            {/* Risk */}
            <span style={styles.colRisk}>
              <span style={{
                ...styles.riskBadge,
                backgroundColor: risk.bg,
                color: risk.color,
              }}>
                {risk.label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Section 2: Current Forecast Weighting
 */
function ForecastWeightingSection({ horizonStack }) {
  if (!horizonStack || horizonStack.length === 0) {
    return null;
  }

  // Sort by weight descending
  const sortedHorizons = [...horizonStack].sort((a, b) => (b.voteWeight || 0) - (a.voteWeight || 0));

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>Current Forecast Weighting</span>
      </div>
      
      {/* Table Header */}
      <div style={styles.weightTableHeader}>
        <span style={styles.colHorizon}>Horizon</span>
        <span style={styles.colInfluence}>Influence on Forecast</span>
      </div>
      
      {/* Table Rows */}
      {sortedHorizons.map((item) => {
        const weight = (item.voteWeight || 0) * 100;
        const barColor = weight > 30 ? '#ef4444' : weight > 15 ? '#8b5cf6' : '#3b82f6';
        
        return (
          <div 
            key={item.horizon} 
            style={styles.weightRow}
            data-testid={`weight-row-${item.horizon}`}
          >
            {/* Horizon Badge */}
            <span style={styles.colHorizon}>
              <span style={styles.horizonBadge}>
                {item.horizon?.toUpperCase()}
              </span>
            </span>
            
            {/* Influence */}
            <span style={styles.colInfluence}>
              <div style={styles.weightBarWrapper}>
                <div style={styles.weightBarBg}>
                  <div style={{
                    ...styles.weightBar,
                    width: `${Math.min(100, weight * 2.5)}%`,
                    backgroundColor: barColor,
                  }} />
                </div>
                <span style={styles.weightText}>{weight.toFixed(0)}%</span>
              </div>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Main Market Phase Engine Component
 */
export function MarketPhaseEngine({ tier = 'TACTICAL', horizonStack, currentFocus }) {
  const [phaseData, setPhaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchPhaseData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/fractal/v2.1/admin/phase-performance?symbol=BTC&tier=${tier}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.ok) {
        setPhaseData(result.phases || []);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch');
      }
    } catch (err) {
      console.error('[MarketPhaseEngine] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tier]);
  
  useEffect(() => {
    fetchPhaseData();
  }, [fetchPhaseData]);

  return (
    <div style={styles.container} data-testid="market-phase-engine">
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Market Phase Engine</span>
      </div>
      
      {/* Section 1: Phase Performance */}
      <PhasePerformanceSection 
        phases={phaseData} 
        loading={loading} 
        error={error} 
      />
      
      {/* Divider */}
      <div style={styles.divider} />
      
      {/* Section 2: Forecast Weighting */}
      <ForecastWeightingSection horizonStack={horizonStack} />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
  },
  section: {
    padding: '16px 20px',
  },
  sectionHeader: {
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '0 20px',
  },
  
  // Phase Performance Table
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '140px 140px 100px 80px',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '140px 140px 100px 80px',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    alignItems: 'center',
  },
  colPhase: {
    display: 'flex',
    alignItems: 'center',
  },
  colSuccess: {
    textAlign: 'center',
  },
  colReturn: {
    textAlign: 'center',
  },
  colRisk: {
    textAlign: 'center',
  },
  phaseBadge: {
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  successValue: {
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'ui-monospace, monospace',
  },
  returnValue: {
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'ui-monospace, monospace',
  },
  riskBadge: {
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  
  // Forecast Weighting Table
  weightTableHeader: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr',
    gap: '16px',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  weightRow: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr',
    gap: '16px',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    alignItems: 'center',
  },
  colHorizon: {
    display: 'flex',
    alignItems: 'center',
  },
  colInfluence: {
    display: 'flex',
    alignItems: 'center',
  },
  horizonBadge: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'ui-monospace, monospace',
  },
  weightBarWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  weightBarBg: {
    flex: 1,
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  weightBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  weightText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'ui-monospace, monospace',
    minWidth: '40px',
    textAlign: 'right',
  },
  
  // States
  loadingContainer: {
    padding: '32px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '13px',
  },
  errorContainer: {
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    margin: '16px 20px',
    borderRadius: '8px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '13px',
  },
  emptyContainer: {
    padding: '32px',
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '13px',
  },
};

export default MarketPhaseEngine;
