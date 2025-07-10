export default function SimpleTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Navigation Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test 1: Regular HTML Links</h2>
        <a href="/about" style={{ color: 'blue', textDecoration: 'underline' }}>Go to About</a>
        <br />
        <a href="/contact" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Contact</a>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test 2: Button with window.location</h2>
        <button 
          onClick={() => {
            console.log('Button clicked - navigating to /about');
            window.location.href = '/about';
          }}
          style={{ padding: '10px', backgroundColor: 'blue', color: 'white' }}
        >
          Button to About
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test 3: Form Submit</h2>
        <form action="/contact" method="get">
          <button type="submit" style={{ padding: '10px', backgroundColor: 'green', color: 'white' }}>
            Form Submit to Contact
          </button>
        </form>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test 4: Alert Test</h2>
        <button 
          onClick={() => alert('Alert works!')}
          style={{ padding: '10px', backgroundColor: 'red', color: 'white' }}
        >
          Show Alert
        </button>
      </div>
    </div>
  );
}