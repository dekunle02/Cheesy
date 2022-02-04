import './App.scss';

import { IconInput } from './subcomponents/form-input/form-input.component';

function App() {

  const action = () => {
    console.log("ACTION!!!")
  }

  return (
    <div className="App">
     <IconInput handleChange={action} handleIconClick={action} materialIconName='expand_more' placeholder="This is a placeholder"/>
    </div>
  );
}

export default App;
