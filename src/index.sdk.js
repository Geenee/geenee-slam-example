import ReactDOM from 'react-dom'
import React from 'react'
import App from './sdk-example/components/App.jsx'


const appContainer = document.getElementById('app')
appContainer
  ? ReactDOM.render(<App />, appContainer)
  : null