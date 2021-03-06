import './auth-form.style.scss'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUserData } from '../../../redux/user/user.slice'

import { ReactComponent as Logo } from '../../../assets/logo.svg';
import useAuth from '../../../api/auth';
import loadStates from '../../../api/loadStates';
import Dialog from '../../../subcomponents/dialog/dialog.component'
import { FlatCard } from '../../../subcomponents/card/card.component'
import { FormInput } from '../../../subcomponents/form-input/form-input.component'
import { Button, TextButton } from '../../../subcomponents/button/button.component'
import ProgressSpinner from "../../../subcomponents/progress/progress.component"


function SignUpForm({ handleOldUser, ...otherProps }) {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadState, setLoadState] = useState(loadStates.FINISHED)

    const auth = useAuth()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleChange = event => {
        const { value, name } = event.target
        switch (name) {
            case 'email':
                setEmail(value)
                break
            case 'password':
                setPassword(value)
                break
            case 'confirmPassword':
                setConfirmPassword(value)
                break
            case 'username':
                setUsername(value)
                break
            default:
                break
        }
    }

    const handleSignUp = event => {
        event.preventDefault()
        if (password !== confirmPassword) {
            alert("Confirm that your passwords match")
            return
        }

        setLoadState(loadStates.LOADING)

        auth.signUp(username, email, password).then(response => {
            setLoadState(loadStates.FINISHED)
            if (response.status === auth.SUCCESS) {
                dispatch(setUserData(response.data))
                navigate('/app', { replace: true })
            } else {
                alert(`Unable to create User...Error:${response.data.message}`)
            }
        }
        )
    }


    return (
        <Dialog {...otherProps}>
            <FlatCard>
                <div className="auth-container">
                    <div className='auth-logo'> <Logo /> </div>
                    <h3 className='auth-title'>Create an account</h3>
                    <h4 className='auth-subtitle'>Let's get started!</h4>
                    
                    <div className='auth-form-container'>
                        <form className='auth-form'>
                            <FormInput
                                type="text"
                                name="username"
                                label="Nickname"
                                value={username}
                                handleChange={handleChange}
                                placeholder="What would you like to be called?"
                                required />
                            <FormInput
                                type="email"
                                name="email"
                                label="Email"
                                value={email}
                                handleChange={handleChange}
                                placeholder="example@email.com"
                                required />
                            <FormInput
                                type="password"
                                name="password"
                                label="Password"
                                value={password}
                                handleChange={handleChange}
                                placeholder="********"
                                required />
                            <FormInput
                                type="password"
                                name="confirmPassword"
                                label="Confirm Password"
                                value={confirmPassword}
                                handleChange={handleChange}
                                placeholder="********"
                                required />

                            <div className='auth-button-container'>
                                <Button block handleClick={handleSignUp}> SUBMIT </Button>
                                <ProgressSpinner canShow={loadState === loadStates.LOADING} />
                            </div>

                        </form>
                        <TextButton block handleClick={handleOldUser}>Already have an account? Sign In</TextButton>
                    </div>


                </div>
            </FlatCard>

        </Dialog>

    )
}

export default SignUpForm