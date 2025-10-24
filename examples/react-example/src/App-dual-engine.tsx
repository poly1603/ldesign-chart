import React, { useState, useEffect } from 'react';
import { Chart } from '@ldesign/chart/react';
import { EChartsEngine, VChartEngine, engineManager } from '@ldesign/chart';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentEngine, setCurrentEngine] = useState('echarts');
  const [lineData, setLineData] = useState([120, 200, 150, 80, 70, 110, 130]);
  const [barData] = useState({
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{ name: 'Revenue', data: [100, 200, 150, 300] }]
  });

  // 初始化引擎
  useEffect(() => {
    engineManager.register('echarts', new EChartsEngine());
    engineManager.register('vchart', new VChartEngine());
    console.log('✅ 双引擎初始化成功');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const refreshData = () => {
    setLineData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50));
  };

  const switchEngine = () => {
    setCurrentEngine(current => current === 'echarts' ? 'vchart' : 'echarts');
  };

  return (
    <div className="container">
      <h1>@ldesign/chart v2.0.0 - Dual Engine Demo</h1>

      <div className="version-badge">
        <span className="badge">✅ Dual Engine</span>
        <span className="badge">✅ ECharts + VChart</span>
        <span className="badge">✅ MiniProgram Support</span>
      </div>

      <div className="controls">
        <button onClick={toggleDarkMode}>
          {darkMode ? '🌞 Light' : '🌙 Dark'}
        </button>
        <button onClick={refreshData}>🔄 Refresh Data</button>
        <button onClick={switchEngine}>
          🔄 Switch Engine: {currentEngine}
        </button>
      </div>

      <div className="chart-grid">
        {/* ECharts Engine */}
        <div className="chart-card">
          <h2>
            Line Chart
            <span className="engine-tag echarts">ECharts Engine</span>
          </h2>
          <Chart
            type="line"
            data={lineData}
            title="Monthly Sales Trend"
            darkMode={darkMode}
            height={300}
            engine="echarts"
          />
        </div>

        {/* VChart Engine */}
        <div className="chart-card">
          <h2>
            Bar Chart
            <span className="engine-tag vchart">VChart Engine</span>
          </h2>
          <Chart
            type="bar"
            data={barData}
            title="Quarterly Revenue"
            darkMode={darkMode}
            height={300}
            engine="vchart"
          />
        </div>
      </div>

      <div className="info">
        <h3>💡 Dual Engine Architecture</h3>
        <p>
          The above charts use different engines, but the configuration code is exactly the same!
          Just specify the <code>engine</code> parameter.
        </p>
        <ul>
          <li><strong>ECharts</strong>: Mature and stable, suitable for Web applications</li>
          <li><strong>VChart</strong>: MiniProgram-first, supports 3D charts</li>
        </ul>
      </div>
    </div>
  );
}

export default App;

