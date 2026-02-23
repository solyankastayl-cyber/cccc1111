/**
 * FRACTAL ANALYSIS — Unified Compact Panel
 * 
 * Combines:
 * - Expected Outcome (Bear/Base/Bull)
 * - Distribution Stats (Reliability)
 * - Top Matches
 * 
 * Into one compact panel
 */

import React, { useState } from 'react';

// Phase colors
const PHASE_COLORS = {
  ACCUMULATION: '#22c55e',
  MARKUP: '#3b82f6',
  DISTRIBUTION: '#f59e0b',
  MARKDOWN: '#ec4899',
  RECOVERY: '#06b6d4',
  CAPITULATION: '#ef4444',
};

// Tooltips
const TOOLTIPS = {
  bear: 'Bear Case — worst-case scenario based on historical patterns. 10th percentile outcome.',
  base: 'Base Case — median expected outcome. 50th percentile.',
  bull: 'Bull Case — best-case scenario. 90th percentile outcome.',
  upside: 'Upside Probability — percentage of matches that resulted in positive returns.',
  drawdown: 'Average Drawdown — typical maximum decline during the forecast period.',
  bullReturn: 'Bull Return — average return in positive outcome scenarios.',
  bearReturn: 'Bear Return — average return in negative outcome scenarios.',
};

/**
 * Tooltip Component
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
          width: '200px',
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
 * Main Component
 */
export function FractalAnalysisPanel({ forecast, overlay, matches, focus }) {
  // Extract data
  const stats = overlay?.stats || {};
  const matchList = matches || overlay?.matches || [];
  const matchCount = matchList.length || stats.matchCount || 0;
  
  // Forecast percentiles
  const p10 = forecast?.p10 ?? stats.p10Return ?? -0.15;
  const p50 = forecast?.p50 ?? stats.medianReturn ?? 0.02;
  const p90 = forecast?.p90 ?? stats.p90Return ?? 0.20;
  
  // Reliability metrics
  const hitRate = stats.hitRate ?? 0.65;
  const avgDrawdown = stats.avgMaxDD ?? -0.16;
  const bullReturn = stats.bullReturn ?? 0.24;
  const bearReturn = stats.bearReturn ?? -0.30;
  
  return (
    <div style={styles.container} data-testid="fractal-analysis-panel">
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Fractal Analysis</span>
        <span style={styles.subtitle}>Based on {matchCount} historical matches</span>
      </div>
      
      {/* Projection Row - Bear | Base | Bull */}
      <div style={styles.projectionRow}>
        <Tip text={TOOLTIPS.bear}>
          <div style={styles.projectionItem}>
            <span style={styles.projLabel}>Bear</span>
            <span style={{ ...styles.projValue, color: '#dc2626' }}>
              {(p10 * 100).toFixed(1)}%
            </span>
          </div>
        </Tip>
        
        <div style={styles.projDivider} />
        
        <Tip text={TOOLTIPS.base}>
          <div style={styles.projectionItem}>
            <span style={styles.projLabel}>Base</span>
            <span style={{ ...styles.projValue, color: p50 >= 0 ? '#16a34a' : '#dc2626' }}>
              {p50 >= 0 ? '+' : ''}{(p50 * 100).toFixed(1)}%
            </span>
          </div>
        </Tip>
        
        <div style={styles.projDivider} />
        
        <Tip text={TOOLTIPS.bull}>
          <div style={styles.projectionItem}>
            <span style={styles.projLabel}>Bull</span>
            <span style={{ ...styles.projValue, color: '#16a34a' }}>
              +{(p90 * 100).toFixed(1)}%
            </span>
          </div>
        </Tip>
      </div>
      
      {/* Reliability Strip */}
      <div style={styles.reliabilityRow}>
        <Tip text={TOOLTIPS.upside}>
          <div style={styles.reliabilityItem}>
            <span style={styles.relLabel}>Upside Prob</span>
            <span style={{ ...styles.relValue, color: hitRate > 0.5 ? '#16a34a' : '#dc2626' }}>
              {(hitRate * 100).toFixed(0)}%
            </span>
          </div>
        </Tip>
        
        <Tip text={TOOLTIPS.drawdown}>
          <div style={styles.reliabilityItem}>
            <span style={styles.relLabel}>Avg DD</span>
            <span style={{ ...styles.relValue, color: '#dc2626' }}>
              {(avgDrawdown * 100).toFixed(1)}%
            </span>
          </div>
        </Tip>
        
        <Tip text={TOOLTIPS.bullReturn}>
          <div style={styles.reliabilityItem}>
            <span style={styles.relLabel}>Bull Ret</span>
            <span style={{ ...styles.relValue, color: '#16a34a' }}>
              +{(bullReturn * 100).toFixed(1)}%
            </span>
          </div>
        </Tip>
        
        <Tip text={TOOLTIPS.bearReturn}>
          <div style={styles.reliabilityItem}>
            <span style={styles.relLabel}>Bear Ret</span>
            <span style={{ ...styles.relValue, color: '#dc2626' }}>
              {(bearReturn * 100).toFixed(1)}%
            </span>
          </div>
        </Tip>
      </div>
      
      {/* Top Matches - Compact */}
      <div style={styles.matchesSection}>
        <div style={styles.matchesHeader}>Top Matches</div>
        <div style={styles.matchesList}>
          {matchList.slice(0, 6).map((m, idx) => {
            const phaseColor = PHASE_COLORS[m.phase] || '#6b7280';
            const ret = m.aftermath?.ret30d ?? m.return ?? 0;
            
            return (
              <div key={m.id || idx} style={styles.matchRow}>
                <span style={styles.matchRank}>#{idx + 1}</span>
                <span style={styles.matchDate}>{m.date || m.startDate?.slice(0, 10)}</span>
                <span style={{ ...styles.matchPhase, backgroundColor: phaseColor }}>
                  {m.phase?.slice(0, 6) || 'N/A'}
                </span>
                <span style={{
                  ...styles.matchReturn,
                  color: ret >= 0 ? '#16a34a' : '#dc2626',
                }}>
                  {ret >= 0 ? '+' : ''}{(ret * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
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
  },
  header: {
    padding: '14px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
  },
  
  // Projection Row
  projectionRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    gap: '24px',
  },
  projectionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    minWidth: '80px',
  },
  projLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  projValue: {
    fontSize: '22px',
    fontWeight: '700',
    lineHeight: 1,
  },
  projDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: '#e5e7eb',
  },
  
  // Reliability Row
  reliabilityRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 20px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#fafafa',
  },
  reliabilityItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  relLabel: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  relValue: {
    fontSize: '14px',
    fontWeight: '700',
  },
  
  // Matches Section
  matchesSection: {
    padding: '12px 20px',
  },
  matchesHeader: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  matchesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  matchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 0',
  },
  matchRank: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    minWidth: '24px',
  },
  matchDate: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    minWidth: '80px',
  },
  matchPhase: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    minWidth: '60px',
    textAlign: 'center',
  },
  matchReturn: {
    fontSize: '12px',
    fontWeight: '700',
    marginLeft: 'auto',
  },
};

export default FractalAnalysisPanel;
