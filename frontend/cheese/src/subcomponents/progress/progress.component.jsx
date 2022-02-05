import Lottie from 'react-lottie'

import animationData from './../../assets/loading.json'

function ProgressSpinner({canShow}) {
    const lottieOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }

    return (
        <div>
            {
                canShow ? <Lottie options={lottieOptions} height={50} width={50} />
                    : ''
            }
        </div>

    )
}

export default ProgressSpinner