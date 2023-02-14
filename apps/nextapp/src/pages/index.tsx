import Head from 'next/head'
import ConversationalForm from '@dbosoft/cf-next';
import { useRef } from 'react';
import data from '../formless-test-data.json';

export default function Home() {

  const formRef = useRef<HTMLFormElement>(null);;
  return (
    <>
      <div className=" flex min-h-screen flex-col items-center justify-center py-2">
        <Head>
          <title>next.js - Conversational Form Example</title>
        </Head>

        <main className="mx-auto w-auto px-4 pt-16 pb-8 sm:pt-24 lg:px-8">
          <h1 className="mx-auto text-center font-extrabold tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
            next.js
            <span className="block bg-gradient-to-r from-brandred to-brandblue bg-clip-text text-transparent px-2">
              Conversational Form Example
            </span>
          </h1>
          <div className="mx-auto mt-5 max-w-xl sm:flex sm:justify-center md:mt-8">
          </div>
          <div>
            <form ref={formRef} id="cf-form" className='invisible' >

              <input type="text" cf-questions="Hi there. What is your name?" name="name" cf-placeholder="Your name"
                defaultValue="Filippa" />
              <input type="text" cf-questions="Awesome, {name}. Would you mind telling me where you live?" name="country"
                defaultValue="United States" cf-placeholder="Country of residence" />
              <fieldset>
                <label htmlFor="tmnj">Thank you. Are you ready to learn more about Conversational Form?</label>
                <select cf-questions="Thank you. Are you ready to learn more about Conversational Form?" name="tmnj"
                  className="form-control">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </fieldset>
              <input type="text" cf-questions="Perfect, let's get started." name="getstarted" />

            </form>
          </div>
          <div className=" flex flex-col items-center justify-center">
            <ConversationalForm
              cf={{
                formRef,
                appearance: {
                  robot: {
                    image: "/images/chatbot.svg"
                  }
                }
              }}
              className="bg-[#2C2C2E] relative mt-6 text-center min-h-[300px] w-full lg:w-[600px]">
              <template id='optionButton'></template>
              <template id='1'></template>
            </ConversationalForm>

            <ConversationalForm
              cf={{ formTags: data }}
              className="bg-[#2C2C2E] relative mt-6 text-center min-h-[300px] w-full lg:w-[600px]">
              <template id='2'></template>
            </ConversationalForm>
          </div>
        </main>
      </div>
    </>
  )
}




