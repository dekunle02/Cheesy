import './sidenav.style.scss'

import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logOutUser} from '../../redux/user/user.slice'

import { ReactComponent as Logo } from '../../assets/logo.svg';
import { Link, useMatch, useResolvedPath } from "react-router-dom";

function NavLink({ text, linkDir, iconName }) {
    const resolvedLink = useResolvedPath(linkDir);
    const match = useMatch({ path: resolvedLink.pathname, end: true });

    return (
        <Link to={resolvedLink}>
            <div className={`navlink ${match ? "active" : ""}`}>
                <div className='navlink-icon-container'>
                    {iconName ? <span className="material-icons">{iconName}</span>
                        : null}
                </div>
                <div className='navlink-text-container'>
                    <h4> {text} </h4>
                </div>
            </div>
        </Link>
    )

}


function SideNav() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const navLinks = [
        { id: 1, link: '', text: 'dashboard', icon: 'dashboard' },
        { id: 2, link: 'pots', text: 'Pots', icon: 'credit_card' },
        { id: 3, link: 'transactions', text: 'Transactions', icon: 'receipt_long' },
    ]

    const handleSignOut = () => {
        dispatch(logOutUser())
        navigate('/', {replace:true})
     }

    return (
        <div className='sidenav'>
            <Link to="/app">
            <div className='sidenav-logo-container'>

                <span className="nav-cheese">CHEE$E</span>
                <div className='sidenav-logo-box' >
                    <Logo />
                </div>
            </div>
            </Link>
            
            <hr className="sidenav-divider" />
            <div className='sidenav-menu'>
                {navLinks.map(item => <NavLink key={item.id} text={item.text} linkDir={item.link} iconName={item.icon} />)}
                <div className="navlink last" onClick={() => handleSignOut()}>
                    <div className='navlink-icon-container'>
                        <span className="material-icons">logout</span>
                    </div>
                    <div className='navlink-text-container'>
                        <h4> Log Out </h4>
                    </div>
                </div>

            </div>

        </div>

    )
}

export default SideNav