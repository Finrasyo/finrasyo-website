export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 1: Basic Button Click</h2>
          <button 
            onClick={() => alert('Test 1 worked!')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Click Me (Should show alert)
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 2: Navigation Button</h2>
          <button 
            onClick={() => window.location.href = '/about'}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Go to About Page
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 3: Direct HTML Link</h2>
          <a href="/about" className="text-blue-600 underline">
            Direct HTML Link to About
          </a>
        </div>
      </div>
    </div>
  );
}