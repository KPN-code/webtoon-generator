import Panel from "./Panel";

export default function PanelList({ panels }) {
  return (
    <div className="panel-list">
      {panels.map((panel) => (
        <Panel key={panel.id} panel={panel} />
      ))}
    </div>
  );
}