import './App.css'
import { Button } from './components/ui/button.tsx'
import {Input} from "@/components/ui/input.tsx";
function App() {

  return (
      <div className="container">
        <h1>Welcome to the React App</h1>
        <Button>Click Me!</Button>
        <p className="footer">© 2023 Your Company</p>
      </div>
  )

}

export default App
