import React from 'react'
import '../css/Card.css'

const Card = ({element}) => {
  return (
    <div className="card">
        <div className="card-image">
            <img src={element.image} alt={element.title} />
        </div>
        <div className="card-content">
            <h3 className="card-title">{element.title}</h3>
            <p className="card-description">{element.description}</p>
        </div>
    </div>
  )
}

export default Card
