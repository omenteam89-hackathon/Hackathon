import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Bus } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <header className="bg-brand text-white shadow-sm sticky top-0 z-10 border-b border-brand">
        <div className="max-w-screen-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Bus className="w-5 h-5" />
            KSRTC Staff Console
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-sm border border-border">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription className="text-muted">Enter your credentials to access the console</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-muted/10 rounded-lg text-muted text-sm border border-dashed border-border">
              Login Form Placeholder
            </div>
            
            <div className="text-center mt-4">
              <Link to="/console/depot" className="text-sm text-brand hover:underline font-medium">
                Skip to Console (Dev) &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
