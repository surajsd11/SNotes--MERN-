import React, { useState } from 'react'
import TagInput from '../../components/Input/TagInput'
import { MdClose } from 'react-icons/md'
import axiosInstance  from '../../utils/axiosInstance'

function AddEditNotes({ noteData,
     onClose , getAllNotes , type }) {

   const [title,setTitle] = useState(noteData?.title || "")
   const [content,setContent] = useState(noteData?.content || "")
   const [tags,setTags] = useState(noteData?.tags || [])

   const [error,setError] = useState(null)

   const addNewNote = async () => {
    
    try {
      const response = await axiosInstance.post("/add-note",{
        title,
        content,
        tags,
      })

      if(response.data && response.data.note) {
           getAllNotes()
           onClose()
      }
       
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message){
          setError(error.response.data.message)
        }
    }
   }

   const editNote = async () => {
    const noteId = noteData._id

    try {
      const response = await axiosInstance.put("/edit-note/" + noteId,{
        title,
        content,
        tags,
      })

      if(response.data && response.data.note) {
           getAllNotes()
           onClose()
      }
       
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message){
          setError(error.response.data.message)
        }
    }
   }
   const handleAddNote = () => {
   
      if(!title){
        setError("please enter the title")
        return
      }

      if(!content){
        setError("please enter the content")
        return
      }

      setError("")

      if(type === 'edit'){
        editNote()
      } else {
        addNewNote()
      }
   }

  return (
    <div className='relative'>

        <button className='w-10 h-10 rounded-full flexs-center justify-center absolute -top-3 -right-3 hover:bg-slate-50' onClick={onClose}>
            <MdClose className='text-xl text-slate-400'/>
        </button>

        <div className='flex flex-col gap-2'>
            <label className='input-label'>TITLE</label>
            <input
              type='text'
              className='text-2xl text-slate-950 outline-none'
              placeholder='Go TO Gym At 5'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
        </div>

        <div className='flex flex-col gap-2 mt-4'>
            <label className='input-label'>Content</label>
            <textarea
              type='text'
              className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
              placeholder='Content'
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
        </div>

        <div className='mt-3'>
            <label className='input-label'>Tags</label>
            <TagInput tags={tags} setTags={setTags}/>
        </div>

        {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

        <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddNote} >
          {type === 'edit' ? 'Update' : 'ADD'}
        </button>
    </div>
  )
}

export default AddEditNotes