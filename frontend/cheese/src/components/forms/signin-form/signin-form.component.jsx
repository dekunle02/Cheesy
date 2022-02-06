import './signin-form.style.scss'

import { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUserData} from '../../../redux/user/user.slice'

import winter from '../../../assets/winter.jpeg';
import { ReactComponent as Logo } from '../../../assets/logo.svg';
import useAuth from '../../../api/auth';
import loadStates from '../../../api/loadStates';
import Dialog from '../../../subcomponents/dialog/dialog.component'
import { FlatCard } from '../../../subcomponents/card/card.component'
import { FormInput } from '../../../subcomponents/form-input/form-input.component'
import { Button, TextButton } from '../../../subcomponents/button/button.component'
import ProgressSpinner from "../../../subcomponents/progress/progress.component"


function SignInForm({handleNewUser,...otherProps }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loadState, setLoadState] = useState(loadStates.FINISHED)
    const auth = useAuth()
    const dispatch = useDispatch()
    const navigate = useNavigate()


    const handleChange = event => {
        const { value, name } = event.target
        if (name === 'email') {
            setEmail(value)
        }
        else if (name === 'password') {
            setPassword(value)
        }
    }

    const handleSignIn = event => {
        event.preventDefault()
        setLoadState(loadStates.LOADING)
        auth.signIn(email, password).then( response => {
            setLoadState(loadStates.FINISHED)
            if (response.status === auth.SUCCESS) {
                dispatch(setUserData(response.data))
                navigate('/app', {replace:true})
            } else {
                alert(response.data.message)
            }
        }
        )
    }
    
    const handleForgotPassword = () => {
        console.log("forgot",email)
    }


    return (
        <Dialog {...otherProps}>
            <FlatCard>
                <div className="signin-form-container">
                    <img src={winter} alt="sign-in-fall" className='signin-picture'></img>

                    <div className='signin-form-box'>

                        <div className='signin-logo'> <Logo /> </div>

                        <div className='signin-form-formbox'>
                            <h3 className='signin-title'>Welcome back</h3>
                            <h4 className='signin-subtitle'>Continue tracking your money</h4>
                            <form className='signinform'>
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
                                <span className="signin-forgot" onClick={handleForgotPassword}>Forgot password?</span>
                                <div className='signin-button-container'>
                                    <Button block handleClick={handleSignIn}> SIGN IN </Button>
                                    <ProgressSpinner canShow={loadState === loadStates.LOADING} />
                                </div>
                            </form>
                            <TextButton block handleClick={handleNewUser} >Don't have an account? Register</TextButton>
                        </div>

                    </div>

                </div>
            </FlatCard>

        </Dialog>

    )
}

export default SignInForm