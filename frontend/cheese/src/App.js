import './App.scss';

import Dialog from './subcomponents/dialog/dialog.component';
import SuccessFailureDialog from './components/dialogs/success-failure-dialog.component';

function App() {

  const items = [
    {text: "Option 1", id: 1},
    {text: "Option 2", id:2},
    {text: "Option 3", id:3}
  ]

  const onItemSelected = (id) => {
    if (id === 1){
      console.log('1 selected!')
    } else if (id === 2) {
      console.log('2 selected')
    } else {
      console.log('3 selected')
    }
  }

  const action = () => {
    console.log("ACTION!!!")
  }

  return (
    <div className="App">
      <SuccessFailureDialog  canDismiss={true} isSuccess message="Transaction Successful!"/>
    </div>
  );
}

export default App;
