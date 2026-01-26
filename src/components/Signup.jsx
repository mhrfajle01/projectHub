import React, { useRef, useState } from "react"
import { Form, Button, Card, Alert, FloatingLabel } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"

export default function Signup() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match")
    }

    try {
      setError("")
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value)
      navigate("/")
    } catch (err) {
      console.error("Signup Error:", err)
      setError(`Failed to create an account: ${err.message}`)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <Card className="glass-card border-0 shadow-lg overflow-hidden">
          {/* Decorative Top Gradient */}
          <div style={{ height: '8px', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' }}></div>
          
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2" style={{ background: '-webkit-linear-gradient(45deg, #4facfe, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Join Project Hub
              </h2>
              <p className="text-muted">Create an account to start sharing.</p>
            </div>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <FloatingLabel controlId="email" label="Email Address" className="mb-3 text-muted">
                <Form.Control type="email" placeholder="name@example.com" ref={emailRef} required className="border-0 bg-light bg-opacity-50" />
              </FloatingLabel>

              <FloatingLabel controlId="password" label="Password" className="mb-3 text-muted">
                <Form.Control type="password" placeholder="Password" ref={passwordRef} required className="border-0 bg-light bg-opacity-50" />
              </FloatingLabel>

              <FloatingLabel controlId="password-confirm" label="Confirm Password" className="mb-3 text-muted">
                <Form.Control type="password" placeholder="Confirm Password" ref={passwordConfirmRef} required className="border-0 bg-light bg-opacity-50" />
              </FloatingLabel>

              <Button 
                disabled={loading} 
                className="w-100 mt-3 py-2 fw-bold border-0 shadow-sm" 
                type="submit"
                style={{ background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)' }}
              >
                Sign Up
              </Button>
            </Form>
          </Card.Body>
          
          <Card.Footer className="bg-light bg-opacity-50 py-3 text-center border-0">
             <span className="text-muted">Already have an account? </span>
             <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#00f2fe' }}>Log In</Link>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}
