export default function EmergencyTest() {
  return (
    <html>
      <head>
        <title>Emergency Test</title>
        <style>{`
          body { font-family: Arial, sans-serif; padding: 20px; }
          .test-button { padding: 10px 20px; margin: 10px; cursor: pointer; }
          .red { background: red; color: white; }
          .blue { background: blue; color: white; }
          .green { background: green; color: white; }
        `}</style>
      </head>
      <body>
        <h1>Emergency Navigation Test</h1>
        
        <div>
          <h2>Test 1: Alert Test</h2>
          <button 
            className="test-button red"
            onClick={() => {
              alert('JavaScript çalışıyor!');
              console.log('Alert button clicked');
            }}
          >
            Alert Test
          </button>
        </div>
        
        <div>
          <h2>Test 2: Console Log Test</h2>
          <button 
            className="test-button blue"
            onClick={() => {
              console.log('Console log test - this should appear');
            }}
          >
            Console Log Test
          </button>
        </div>
        
        <div>
          <h2>Test 3: Direct Navigation</h2>
          <button 
            className="test-button green"
            onClick={() => {
              console.log('Navigating to /about...');
              window.location.href = '/about';
            }}
          >
            Go to About Page
          </button>
        </div>
        
        <div>
          <h2>Test 4: HTML Links</h2>
          <a href="/about" style={{color: 'blue', textDecoration: 'underline'}}>
            HTML Link to About
          </a>
          <br />
          <a href="/contact" style={{color: 'blue', textDecoration: 'underline'}}>
            HTML Link to Contact
          </a>
        </div>
        
        <script>{`
          console.log('Emergency test page loaded');
          document.addEventListener('click', function(e) {
            console.log('Click detected on:', e.target.tagName, e.target.textContent);
          });
        `}</script>
      </body>
    </html>
  );
}