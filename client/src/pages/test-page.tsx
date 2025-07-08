import { Link } from "wouter";

export default function TestPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Page</h1>
      <nav>
        <Link href="/about" style={{ margin: "10px", color: "blue" }}>
          Go to About
        </Link>
        <br />
        <Link href="/how-it-works" style={{ margin: "10px", color: "blue" }}>
          Go to How it Works
        </Link>
        <br />
        <Link href="/contact" style={{ margin: "10px", color: "blue" }}>
          Go to Contact
        </Link>
      </nav>
    </div>
  );
}