"use client"

import {useState} from "react"

export default function Search(){

const [q,setQ]=useState("")

return(

<input
value={q}
onChange={e=>setQ(e.target.value)}
placeholder="Tìm tên phim..."
className="bg-[#020617] border border-gray-700 px-4 py-2 rounded"
/>

)

}