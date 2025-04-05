import React from 'react'

const Faq = (props) => {
  return (
    <>
      <h1>{props.Question}</h1>
      <p>{props.answer}</p>
    </>
  )
}

export default Faq
