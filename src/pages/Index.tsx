import{Optimizer} from '@/components/Oprimizer';

const Index = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Football Lineup Optimizer</h1>
        <p className="text-muted-foreground">
          Upload your team and opponent CSVs to get the optimal lineup with tactical insights
        </p>
      </div>
      <Optimizer />
    </div>
  );
};

export default Index;