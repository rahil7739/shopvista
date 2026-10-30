const SectionPage = ({ title }) => (
  <section className="section-placeholder">
    <p className="eyebrow">STORE MANAGEMENT</p>
    <h1>{title}</h1>
    <div className="panel">
      <h2>{title} workspace</h2>
      <p className="muted-copy">
        This section is available in the navigation, but its data and management
        actions are not connected yet.
      </p>
    </div>
  </section>
);

export default SectionPage;
