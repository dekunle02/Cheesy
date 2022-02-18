import './home.style.scss'
import {useState} from 'react'
import { ReactComponent as Logo } from '../../assets/logo.svg'
import { Button } from '../../subcomponents/button/button.component'
import { Card } from '../../subcomponents/card/card.component'

import SignInForm from '../../components/forms/auth-form/signin-form.component'
import SignUpForm from '../../components/forms/auth-form/signup-form.component'

function HomePage() {
    const [canShowSignInForm, setShowSignInForm] = useState(false)
    const [canShowSignUpForm, setShowSignUpForm] = useState(false)

    const handleNewUser = () => {
        setShowSignUpForm(true)
        setShowSignInForm(false)
    }

    const handleOldUser = () => {
        setShowSignInForm(true)
        setShowSignUpForm(false)
    }

    return (
        <div className="home-container">
            
            <SignInForm handleNewUser={handleNewUser} canShow={canShowSignInForm} setCanShow={setShowSignInForm} />
            <SignUpForm handleOldUser={handleOldUser} canShow={canShowSignUpForm} setCanShow={setShowSignUpForm} />
            
            <div className="home-nav">
                <div className='home-logo-box'> <Logo /> </div>
                <span className="home-cheese">CHEE$E</span>
                <div className='home-signin-button'>
                    <Button inverse block handleClick={() => setShowSignInForm(true)}> SIGN IN</Button>
                </div>
            </div>

            <div className="home-content">
                <div className="home-call-to-action-card-holder">
                <Card>
                    <div className="home-call-to-action">
                        <div className="home-main-message">
                            <span>Managing your money</span>
                            <span>has never been easier!</span>
                            <span className="home-sub-message">Regain complete control over all your money. You decide how any </span>
                        </div>

                        <div className='home-register-button-container'>
                            <Button block handleClick={() => setShowSignUpForm(true)}>REGISTER NOW</Button>
                        </div>
                    </div>
                </Card>
                </div>
                
            </div>

        </div>
    )
}

export default HomePage