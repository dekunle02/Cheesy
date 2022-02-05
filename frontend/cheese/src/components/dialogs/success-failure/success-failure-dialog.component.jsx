import './success-failure-dialog.style.scss'

import { ReactComponent as SuccessLogo } from '../../../assets/success.svg';
import { ReactComponent as ErrorLogo } from '../../../assets/error.svg';

import Dialog from '../../../subcomponents/dialog/dialog.component'
import { FlatCard } from '../../../subcomponents/card/card.component'


/**
 * isSuccess -> Toggles betweem succes and failure icons
 * message => Message attached to icon
 * canDismiss => to dismiss underlying dialog 
 * 
 */

function SuccessFailureDialog({ isSuccess, message, ...otherProps}){
    return (
        <Dialog {...otherProps}>
            <FlatCard>
                <div className='success-content'>
                    <div className='logo-container'>
                        {
                        isSuccess ?
                            <SuccessLogo/>
                        : <ErrorLogo/>
                        }
                    </div>
                    <h4>{message}!</h4>
                </div>
            </FlatCard>
        </Dialog>
    )
}

export default SuccessFailureDialog