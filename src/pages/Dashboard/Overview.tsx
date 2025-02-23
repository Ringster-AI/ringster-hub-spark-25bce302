
const Overview = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Welcome to Ringster</h2>
          <p className="text-muted-foreground">
            This is your dashboard overview. More features coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
