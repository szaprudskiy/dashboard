import React from 'react'
import Section from './Section'

const Dashboard = ({ handleLogout }) => {
  return (
    <div>
      <Section handleLogout={handleLogout} />
    </div>
  )
}

export default Dashboard
