import React, { useRef, useState } from "react"
import { Form, Button, Card, Alert, FloatingLabel } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError("")
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      navigate("/")
    } catch {
      setError("Failed to log in")
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <Card className="glass-card border-0 shadow-lg overflow-hidden">
          {/* Decorative Top Gradient */}
          <div style={{ height: '8px', background: 'linear-gradient(90deg, #FF512F 0%, #DD2476 100%)' }}></div>
          
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2" style={{ background: '-webkit-linear-gradient(45deg, #FF512F, #DD2476)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Project Hub
              </h2>
              <p className="text-muted">Welcome back! Please log in.</p>
            </div>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <FloatingLabel controlId="email" label="Email Address" className="mb-3 text-muted">
                <Form.Control type="email" placeholder="name@example.com" ref={emailRef} required className="border-0 bg-light bg-opacity-50" />
              </FloatingLabel>

              <FloatingLabel controlId="password" label="Password" className="mb-3 text-muted">
                <Form.Control type="password" placeholder="Password" ref={passwordRef} required className="border-0 bg-light bg-opacity-50" />
              </FloatingLabel>

              <Button 
                disabled={loading} 
                className="w-100 mt-3 py-2 fw-bold border-0 shadow-sm" 
                type="submit"
                style={{ background: 'linear-gradient(45deg, #FF512F, #DD2476)' }}
              >
                Log In
              </Button>
            </Form>

            <div className="w-100 text-center mt-3">
              <Link to="/forgot-password" className="text-decoration-none text-muted small">Forgot Password?</Link>
            </div>
          </Card.Body>
          
          <Card.Footer className="bg-light bg-opacity-50 py-3 text-center border-0">
             <span className="text-muted">Need an account? </span>
             <Link to="/signup" className="fw-bold text-decoration-none" style={{ color: '#DD2476' }}>Sign Up</Link>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}
