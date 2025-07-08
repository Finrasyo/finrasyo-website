import { Link, useLocation } from "wouter";

export default function TestPage() {
  const [location, navigate] = useLocation();
  
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Test Page - Routing Debug</h1>
      <p><strong>Current Location:</strong> {location}</p>
      
      <div style={{ margin: "20px 0" }}>
        <h3>Manual Navigation (onClick):</h3>
        <button onClick={() => navigate("/about")} style={{ margin: "5px", padding: "10px" }}>
          Go to About
        </button>
        <button onClick={() => navigate("/how-it-works")} style={{ margin: "5px", padding: "10px" }}>
          Go to How it Works
        </button>
        <button onClick={() => navigate("/contact")} style={{ margin: "5px", padding: "10px" }}>
          Go to Contact
        </button>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>Link Components:</h3>
        <Link href="/about">
          <a style={{ color: "blue", margin: "10px", display: "block" }}>Link to About</a>
        </Link>
        <Link href="/how-it-works">
          <a style={{ color: "blue", margin: "10px", display: "block" }}>Link to How it Works</a>
        </Link>
        <Link href="/contact">
          <a style={{ color: "blue", margin: "10px", display: "block" }}>Link to Contact</a>
        </Link>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>Regular Links (should NOT work with SPA):</h3>
        <a href="/about" style={{ color: "red", margin: "10px", display: "block" }}>Regular link to About</a>
        <a href="/how-it-works" style={{ color: "red", margin: "10px", display: "block" }}>Regular link to How it Works</a>
        <a href="/contact" style={{ color: "red", margin: "10px", display: "block" }}>Regular link to Contact</a>
      </div>
    </div>
  );
}