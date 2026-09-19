import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export type LoginField = 'email' | 'password'
export interface LoginFormState { email: string; password: string }
export interface LoginFieldErrors { email?: string; password?: string }
export type LoginStatus = 'idle' | 'loading' | 'error' | 'success'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(fields: LoginFormState): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  if (!fields.email.trim()) errors.email = 'El correo electrónico es obligatorio.'
  else if (!EMAIL_REGEX.test(fields.email.trim())) errors.email = 'Ingresa un correo electrónico válido.'
  if (!fields.password) errors.password = 'La contraseña es obligatoria.'
  else if (fields.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  return errors
}

function mapSupabaseError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (message.includes('Email not confirmed')) return 'Debes confirmar tu correo. Revisa tu bandeja.'
  if (message.includes('Too many requests')) return 'Demasiados intentos. Espera un momento.'
  return 'Error al iniciar sesión. Intenta de nuevo.'
}

export function useLoginForm() {
  const navigate = useNavigate()
  const [fields, setFields] = useState<LoginFormState>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<LoginStatus>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name as LoginField]) setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    if (serverError) setServerError('')
  }

  function toggleShowPassword() { setShowPassword(prev => !prev) }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError('')

    const errors = validate(fields)
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }

    setStatus('loading')

    // 1. Login con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fields.email.trim(),
      password: fields.password,
    })

    if (error) {
      setStatus('error')
      setServerError(mapSupabaseError(error.message))
      return
    }

    if (!data.user) {
      setStatus('error')
      setServerError('Error inesperado. Intenta de nuevo.')
      return
    }

    // 2. Leer perfil para verificar estado y rol
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setStatus('error')
      setServerError('No se encontró tu perfil. Contacta al docente.')
      return
    }

    if (!profile.is_active) {
      await supabase.auth.signOut()
      setStatus('error')
      setServerError('Tu cuenta está archivada. Contacta a tu docente.')
      return
    }

    // 3. Éxito — redirigir según rol
    setStatus('success')

    // Pequeña espera para que el AuthContext procese el onAuthStateChange
    await new Promise(r => setTimeout(r, 300))

    if (profile.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  function resetForm() {
    setFields({ email: '', password: '' })
    setFieldErrors({})
    setServerError('')
    setStatus('idle')
  }

  return {
    fields, fieldErrors, serverError, showPassword, status,
    isLoading: status === 'loading',
    handleChange, handleSubmit, toggleShowPassword, resetForm,
  }
}
