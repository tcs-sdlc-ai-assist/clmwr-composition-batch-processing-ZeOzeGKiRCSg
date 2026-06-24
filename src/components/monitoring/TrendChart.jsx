import PropTypes from 'prop-types';

/**
 * Computes the maximum count value from the trend data array.
 * @param {Array<{time: string, count: number}>} trendData - The trend data points.
 * @returns {number} The maximum count value, or 1 if no data or all zeros.
 */
function getMaxCount(trendData) {
  if (!Array.isArray(trendData) || trendData.length === 0) {
    return 1;
  }
  const max = Math.max(...trendData.map((d) => d.count));
  return max > 0 ? max : 1;
}

/**
 * Builds a human-readable summary of the trend data for screen readers.
 * @param {Array<{time: string, count: number}>} trendData - The trend data points.
 * @returns {string} A descriptive summary string.
 */
function buildAriaLabel(trendData) {
  if (!Array.isArray(trendData) || trendData.length === 0) {
    return 'Validation failure trend chart with no data available.';
  }

  const total = trendData.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...trendData.map((d) => d.count));
  const min = Math.min(...trendData.map((d) => d.count));

  return `Validation failure trend chart over ${trendData.length} minute intervals. Total failures: ${total}. Range: ${min} to ${max} per minute.`;
}

/**
 * Formats a time string for display on the chart axis.
 * Attempts to parse as a date and return HH:MM format; falls back to the raw string.
 * @param {string} time - The time value from the trend data point.
 * @returns {string} A formatted time label.
 */
function formatTimeLabel(time) {
  if (!time) {
    return '';
  }
  try {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return String(time);
    }
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(time);
  }
}

/**
 * Computes the bar height percentage for a given count relative to the max.
 * Ensures a minimum visible height of 4% for non-zero values.
 * @param {number} count - The failure count for this interval.
 * @param {number} maxCount - The maximum failure count across all intervals.
 * @returns {number} A percentage value between 0 and 100.
 */
function computeBarHeight(count, maxCount) {
  if (count <= 0) {
    return 0;
  }
  return Math.max(Math.round((count / maxCount) * 100), 4);
}

/**
 * Returns a Tailwind-compatible color class for the bar based on count severity.
 * @param {number} count - The failure count for this interval.
 * @param {number} maxCount - The maximum failure count across all intervals.
 * @returns {string} A fill color string for SVG or a Tailwind bg class.
 */
function getBarColor(count, maxCount) {
  if (count <= 0) {
    return '#e5e7eb'; // gray-200
  }
  const ratio = count / maxCount;
  if (ratio >= 0.75) {
    return '#ef4444'; // error-500
  }
  if (ratio >= 0.5) {
    return '#f87171'; // error-400
  }
  if (ratio >= 0.25) {
    return '#fbbf24'; // warning-400
  }
  return '#60a5fa'; // brand-400
}

/**
 * TrendChart — Simple SVG-based bar chart showing validation failure counts
 * over time intervals (typically last 10 minutes, bucketed by minute).
 * No external charting library — uses inline SVG for rendering.
 * Accessible with aria-label describing the trend.
 *
 * User Stories: SCRUM-9791, SCRUM-9785
 *
 * @param {Object} props - Component props.
 * @param {Array<{time: string, count: number}>} props.trendData - Array of data points with time label and failure count.
 * @returns {JSX.Element} The rendered trend chart component.
 */
export function TrendChart({ trendData }) {
  const data = Array.isArray(trendData) ? trendData : [];
  const maxCount = getMaxCount(data);
  const ariaLabel = buildAriaLabel(data);

  /** SVG layout constants */
  const chartWidth = 600;
  const chartHeight = 200;
  const paddingTop = 20;
  const paddingBottom = 40;
  const paddingLeft = 40;
  const paddingRight = 16;
  const drawableWidth = chartWidth - paddingLeft - paddingRight;
  const drawableHeight = chartHeight - paddingTop - paddingBottom;

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Failure Trend
          </h3>
        </div>
        <div className="px-4 py-8 sm:px-6">
          <div
            className="flex items-center justify-center text-sm text-gray-400"
            role="img"
            aria-label={ariaLabel}
          >
            <p>No trend data available.</p>
          </div>
        </div>
      </div>
    );
  }

  const barCount = data.length;
  const barGap = Math.max(Math.round(drawableWidth * 0.02), 2);
  const totalGaps = barCount > 1 ? (barCount - 1) * barGap : 0;
  const barWidth = Math.max(Math.floor((drawableWidth - totalGaps) / barCount), 4);

  /**
   * Computes Y-axis grid lines for the chart.
   * @returns {Array<{value: number, y: number}>} Array of grid line positions.
   */
  const getGridLines = () => {
    const lines = [];
    const steps = Math.min(maxCount, 5);
    for (let i = 0; i <= steps; i++) {
      const value = Math.round((maxCount / steps) * i);
      const y = paddingTop + drawableHeight - (drawableHeight * (value / maxCount));
      lines.push({ value, y });
    }
    return lines;
  };

  const gridLines = getGridLines();

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Failure Trend
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            Last {barCount} {barCount === 1 ? 'minute' : 'minutes'}
          </span>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          role="img"
          aria-label={ariaLabel}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {gridLines.map((line) => (
            <g key={`grid-${line.value}`}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={chartWidth - paddingRight}
                y2={line.y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <text
                x={paddingLeft - 6}
                y={line.y + 4}
                textAnchor="end"
                className="text-xs"
                fill="#9ca3af"
                fontSize="11"
              >
                {line.value}
              </text>
            </g>
          ))}

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + drawableHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + drawableHeight}
            stroke="#d1d5db"
            strokeWidth="1"
          />

          {/* Bars */}
          {data.map((point, index) => {
            const heightPercent = computeBarHeight(point.count, maxCount);
            const barHeight = (heightPercent / 100) * drawableHeight;
            const x = paddingLeft + index * (barWidth + barGap);
            const y = paddingTop + drawableHeight - barHeight;
            const fillColor = getBarColor(point.count, maxCount);
            const timeLabel = formatTimeLabel(point.time);

            return (
              <g key={`bar-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 0)}
                  fill={fillColor}
                  rx="2"
                  ry="2"
                >
                  <title>{`${timeLabel}: ${point.count} failure${point.count === 1 ? '' : 's'}`}</title>
                </rect>

                {/* Count label above bar */}
                {point.count > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {point.count}
                  </text>
                )}

                {/* Time label below bar */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + drawableHeight + 16}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="9"
                  transform={`rotate(-45, ${x + barWidth / 2}, ${paddingTop + drawableHeight + 16})`}
                >
                  {timeLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#60a5fa' }} />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#fbbf24' }} />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#f87171' }} />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

TrendChart.propTypes = {
  trendData: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default TrendChart;