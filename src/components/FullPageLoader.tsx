import { Loader2 } from 'lucide-react';

const FullPageLoader = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};

export default FullPageLoader;