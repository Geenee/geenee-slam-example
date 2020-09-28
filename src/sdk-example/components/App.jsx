
import React from "react";

// import @geenee/sdk-core
import Geenee from '../../libs/sdk-core/sdk-core'

import GeeneeSlam from '../../libs/sdk-slam/sdk-slam'

// import @geenee/sdk-scene-library
import "../../libs/sdk-scene-library/index.css";
import { SlamScene } from '../../libs/sdk-scene-library/index'

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";


const App = () => {
  // Keep state
  const [debug, setDebug] = React.useState(true)
  const [projects, setProjects] = React.useState([])

  // NOTE Define project IDs here!
  const projectID = '882ee131-4d6f-4f2b-82a1-237eac573be9'

  // little helper ;)
  const log = (...props) => {
    if (debug) console.log('Slam:', ...props)
  }

  const appStarted = () => {
    log('app started')
  }

  const EVENTS = {
    'geenee-app-started': appStarted,
  }

  React.useEffect(() => {
    Geenee.setTenant(process.env.GEENEE_TENANT);
    setProjects([projectID])

    // Listen to events
    for (let [key, value] of Object.entries(EVENTS)) {
      window.addEventListener(key, value);
    }

    return () => {
      // Remove listeners
      for (let [key, value] of Object.entries(EVENTS)) {
        window.removeEventListener(key, value);
      }
    }
  }, [])

  return (
    <div>
      <SlamScene projects={projects} />
      <div style={{ position: 'absolute', bottom: '5vh', right: '5vw' }}>
        <button onClick={GeeneeSlam.stop} style={{ width: '15vw', height: '5vh' }}>Stop</button>
      </div>
    </div>
  )
}

export default App;
