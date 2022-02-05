import './home.style.scss'

import { ReactComponent as Logo } from '../../assets/logo.svg'
import { Button } from '../../subcomponents/button/button.component'
import { Card } from '../../subcomponents/card/card.component'

function HomePage() {
    return (
        <div className="home-container">
            <div className="home-nav">
                <div className='home-logo-box'> <Logo /> </div>
                <span className="home-cheese">CHEE$E</span>
                <div className='home-signin-button'>
                    <Button inverse block > SIGN IN</Button>
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
                            <Button block >REGISTER NOW</Button>
                        </div>
                    </div>
                </Card>
                </div>
                
            </div>



        </div>
    )
}

export default HomePage