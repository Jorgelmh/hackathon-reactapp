import React from 'react'
import { useRouter } from 'next/router'

const Id = () => {
  const router = useRouter()
  return (
    <>
      <h1>Testing page {router.query.roomid}</h1>
    </>
  )
}

export default Id
