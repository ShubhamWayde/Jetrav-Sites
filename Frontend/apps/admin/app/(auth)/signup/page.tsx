'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import style from "../auth.module.css"

export default function SignUp() {
    const router = useRouter()

    useEffect(() => {
    }, [router])

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        router.push('/dashboard')
    }

    return (
        <div className={style.authPage}>
            <form onSubmit={handleSignUp} className={style.authForm}>
                <div className={style.authWrapper}>
                    <div className={style.authHeader}>
                        <h1>Sign Up</h1>
                        <p>Enter all details to register your account</p>
                    </div>
                    <div className={style.authFields}>
                        <div className={style.formField}>
                            <input className='input-field' name="email" type="email" placeholder="Email" required />
                        </div>
                        <div className={style.formField}>
                            <input className='input-field' name="password" type="password" placeholder="Password" required />
                        </div>
                        <button type="submit" className='btn btn-primary btn-full'>
                            Sign In
                        </button>
                    </div>
                    <div className={style.authFooter}>
                        <p>Already have an account? <a href="/signin">Login</a></p>
                    </div>
                </div>
            </form>
        </div>
    )
}
