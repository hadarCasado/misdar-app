import './BuildingTabs.css';

const BuildingTabs = ({ buildings, activeTab, setActiveTab }) => (
  <div className="tabs-container">
    {buildings.map((b) => (
      <button
        key={b.id}
        onClick={() => setActiveTab(b.id)}
        className={`tab-button ${activeTab === b.id ? 'active' : ''}`}
      >
        {b.name}
      </button>
    ))}
  </div>
);

export default BuildingTabs;