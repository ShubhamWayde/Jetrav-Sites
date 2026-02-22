'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import style from "../auth.module.css"

export default function SignIn() {
    const router = useRouter()

    useEffect(() => {
    }, [router])

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        router.push('/dashboard')
    }

    return (
        <div className={style.authPage}>
            <form onSubmit={handleSignIn} className={style.authForm}>
                <div className={style.authWrapper}>
                    <div className={style.authHeader}>
                        <h1>Sign In</h1>
                        <p>Enter you phone number to continue</p>
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
                        <p>No account? <a href="/signup">Sign up</a></p>
                    </div>
                </div>
            </form>
        </div>
    )
}
