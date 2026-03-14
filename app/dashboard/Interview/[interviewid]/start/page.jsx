"use client"
import { db } from '@/utils/db';
import { mockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import QuestionSections from './_components/QuestionSections';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


function  StartInterview({params}) {

    const [InterviewData,setInterviewData]=useState();
    const [MockInterviewQuestion,setMockInterviewQuestion]=useState();
    const [activeQuestion, setActiveQuestion]=useState(0);
    useEffect(()=>{
        getInterviewDetails();

    },[]); 
    useEffect(() => {
      if (MockInterviewQuestion) {
        console.log("MockInterviewQuestion is ready:", MockInterviewQuestion);
        
      }
    }, [MockInterviewQuestion]);

    const getInterviewDetails=async()=>{
      const results= await db.select().from(mockInterview).where(eq(mockInterview.mockId,params.interviewid ));
         const jsonResp=JSON.parse(results[0].jsonMockResp)
        setMockInterviewQuestion(jsonResp); // error
        setInterviewData(results[0]);
       
      
    }
  return MockInterviewQuestion&& (
    
    <div>
     <div className=' grid grid-cols-1 md:grid-cols-2  gap-10'>
   
        {/* Questions */}
         <QuestionSections MockInterviewQuestion={MockInterviewQuestion}
         activeQuestion={activeQuestion} setActiveQuestion={setActiveQuestion}></QuestionSections>
      

        {/* Videos/audio recording  */}
        <RecordAnswerSection  MockInterviewQuestion={MockInterviewQuestion}
         activeQuestion={activeQuestion} InterviewData={InterviewData}></RecordAnswerSection>
       
     </div>
     <div className='flex flex-row justify-end gap-10 '>
      {activeQuestion>0&&
      <Button onClick={()=>setActiveQuestion(activeQuestion-1)}>Previous Question</Button>}
      {activeQuestion!=MockInterviewQuestion.length-1 &&
      <Button onClick={()=>setActiveQuestion(activeQuestion+1)}>Next Question</Button>}
     {activeQuestion==MockInterviewQuestion.length-1 &&
     <Link href={'/dashboard/Interview/'+InterviewData.mockId+'/Feedback'}><Button>End Interview</Button></Link>
     }
     </div>
    </div>
  )
}

export default  StartInterview
