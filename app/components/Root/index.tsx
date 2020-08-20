import React from 'react'
import App from '../App'
import Authentication from '../Authentication'

const Root = () => (
    <Authentication>
        <App />
    </Authentication>
)

export default Root;
