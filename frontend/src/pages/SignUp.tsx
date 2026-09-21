import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:8000'

function Signup() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('🔥 NEW SIGNUP CODE')
    setError('')
    setSuccess('')

    const usernameValue = username.trim()
    const emailValue = email.trim()

    if (
      !usernameValue ||
      !emailValue ||
      !password ||
      !password2
    ) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const payload = {
        username: usernameValue,
        email: emailValue,
        password: password,
        password2: password2,
      }

      const response = await fetch(`${API_URL}/accounts/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (typeof data === 'object' && data !== null) {
          const messages = Object.entries(data)
            .map(([field, value]) => {
              if (Array.isArray(value)) {
                return `${field}: ${value.join(', ')}`
              }

              return `${field}: ${String(value)}`
            })
            .join(' | ')

          throw new Error(
            messages || `Registration failed (${response.status})`
          )
        }

        throw new Error(`Registration failed (${response.status})`)
      }

      setSuccess('Account created successfully.')

      setTimeout(() => {
        navigate('/login')
      }, 800)
    } catch (err) {
      console.error('SIGNUP ERROR:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create account.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-card">

        <div className="signup-header">
          <span className="signup-eyebrow">
            CREATE ACCOUNT
          </span>

          <h1>Sign Up</h1>

          <p>
            Create your account to start using WebNovels.
          </p>
        </div>

        <form
          className="signup-form"
          onSubmit={handleSubmit}
        >
          <div className="signup-field">
            <label htmlFor="signup-username">
              Username
            </label>

            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signup-email">
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              placeholder="Enter your password"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signup-password2">
              Confirm Password
            </label>

            <input
              id="signup-password2"
              type="password"
              value={password2}
              onChange={(event) =>
                setPassword2(event.target.value)
              }
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          {success && (
            <div className="signup-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign In
          </Link>
        </div>

      </div>
    </main>
  )
}

export default Signup
