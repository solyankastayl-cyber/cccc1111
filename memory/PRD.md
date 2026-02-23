# Fractal Module - PRD

## Дата последнего обновления: 2026-02-23

## Original Problem Statement
- Клонировать репозиторий https://github.com/solyankastayl-cyber/ooooo
- Поднять фронт, бэк, админку
- Работать только с модулем Fractal
- Продолжить недоработанную логику обновления по фронту

## Architecture
- **Backend**: Node.js + TypeScript + Fastify (порт 8002, проксируется через Python на 8001)
- **Frontend**: React + Tailwind CSS (порт 3000)
- **Database**: MongoDB
- **Proxy**: Python FastAPI на порту 8001 проксирует запросы к TypeScript backend

## What Was Implemented

### UI Refactoring - Market Phase Engine & Institutional Consensus (2026-02-23)
**Problem**: Пользователь запросил переместить секцию "Current Forecast Influence" из MarketPhaseEngine в InstitutionalConsensus (ConsensusPanel).

**Changes Made**:
- `MarketPhaseEngine.jsx`: Удалена секция "Forecast Weighting", теперь показывает только "Historical Phase Performance" таблицу
- `ConsensusPanel.jsx`: Добавлена третья колонка "Forecast Influence" рядом с "Vote by Horizon" и "Layer Influence"
- `FractalPage.js`: Передаётся `horizonStack` prop в ConsensusPanel

**New 3-Column Layout in ConsensusPanel**:
1. **Vote by Horizon** - голоса по горизонтам из consensus74.votes
2. **Layer Influence** - влияние слоёв (Structure/Tactical/Timing) из adaptiveMeta
3. **Forecast Influence** - веса прогноза по горизонтам из horizonStack.voteWeight

**Tooltip (English)**: "Model weighting applied to each horizon in projection calculations."

**Files Modified**:
- `/app/frontend/src/components/fractal/ConsensusPanel.jsx` - добавлена третья колонка
- `/app/frontend/src/pages/FractalPage.js` - передача horizonStack в ConsensusPanel

### Previous UI Refactoring Work (Previous Sessions)
- Создание `MarketPhaseEngine.jsx` из объединения `PhaseHeatmap.jsx` и `HorizonStack.jsx`
- Создание компактного `ConsensusPanel.jsx` с двумя колонками
- Создание `FractalAnalysisPanel.jsx` из объединения `ForecastSummary.jsx`, `DistributionStats.jsx`, `MatchesList.jsx`
- Все тултипы переведены на английский язык

### Symmetric Chart for Replay Mode (Earlier)
- Добавлен параметр `displayWindow` для симметричного отображения графика
- NOW всегда по центру графика

## Tested (2026-02-23)
- ✅ Frontend: 100% (12/12 тестов пройдено)
- ✅ MarketPhaseEngine показывает только Historical Phase Performance
- ✅ ConsensusPanel имеет 3 колонки: Vote by Horizon, Layer Influence, Forecast Influence
- ✅ Forecast Influence показывает данные для всех 6 горизонтов
- ✅ Тултипы на английском языке

## P0 (Critical) - COMPLETED ✅
- [x] Симметричный график вокруг NOW для всех horizons
- [x] Переименование P10/P25/P50/P75/P90 в Bear/Bull Case
- [x] Перемещение Forecast Influence из MarketPhaseEngine в ConsensusPanel

## User Personas
- Трейдеры криптовалют, использующие фрактальный анализ
- Аналитики, изучающие исторические паттерны BTC

## Core Requirements (Static)
- Fractal overlay mode для сравнения текущей цены с историческими паттернами
- Симметричный график с NOW по центру
- Поддержка множества horizons (7d - 365d)
- Компактные UI панели с английскими тултипами

## Technical Debt (Optional)
- Удаление неиспользуемых компонентов: `PhaseHeatmap.jsx`, `HorizonStack.jsx`, старый `ConsensusPanel`, `ForecastSummary.jsx`, `DistributionStats.jsx`, `MatchesList.jsx`

## Backlog
- P1: Улучшение UI/UX визуализации фракталов
- P2: Добавление экспорта данных
