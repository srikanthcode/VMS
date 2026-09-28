import { Chart as ChartJS } from 'chart.js'

export const getChartTheme = (theme) => {
  const light = theme === 'light'
  return {
    tick: light ? '#495057' : '#b8c5d6',
    grid: light ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    legend: light ? '#1a1a2e' : '#ffffff',
    empty: light ? '#ced4da' : '#2a2a4a'
  }
}

export const syncChartDefaults = (theme) => {
  const t = getChartTheme(theme)
  ChartJS.defaults.color = t.tick
  ChartJS.defaults.borderColor = t.grid
}

export const cartesianOptions = (theme) => {
  const t = getChartTheme(theme)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: t.legend } }
    },
    scales: {
      x: { ticks: { color: t.tick }, grid: { color: t.grid } },
      y: { ticks: { color: t.tick }, grid: { color: t.grid } }
    }
  }
}

export const doughnutOptions = (theme) => {
  const t = getChartTheme(theme)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: t.legend, boxWidth: 12, padding: 12 }
      }
    }
  }
}
