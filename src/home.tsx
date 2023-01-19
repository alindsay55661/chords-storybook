import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className="w-full">
      <div className="my-0 mx-auto max-w-3xl p-4">
        <h1 className="pt-4 text-center text-3xl font-bold">
          "Find the chord" Storybook project
        </h1>
        <div className="flex flex-wrap place-content-evenly pt-8 pb-8 sm:pb-16">
          <img
            src="assets/storybook-logo.svg"
            className="m-4 w-20"
            alt="Storybook logo"
          />
          <span className="pt-8 text-4xl font-bold">+</span>
          <img
            src="assets/vite-logo.svg"
            className="m-4 w-20"
            alt="Vite logo"
          />
          <span className="pt-8 text-4xl font-bold">+</span>
          <img
            src="assets/vitest-logo.svg"
            className="m-4 w-20"
            alt="Vitest logo"
          />
          <span className="pt-8 text-4xl font-bold">+</span>
          <img
            src="assets/react.svg"
            className="m-4 w-20"
            alt="React logo"
          />
          <span className="pt-8 text-4xl font-bold">+</span>
          <img
            src="assets/midi-logo.svg"
            className="m-4 w-20"
            alt="Midi logo"
          />
        </div>

        <p>
          This is a small project I put together to help me with my musical
          studies and learn some new tech. I dove into:
        </p>

        <ul className="list-disc p-4 pl-8">
          <li>Engineering for musical and technical midi interpretation</li>
          <li>
            Storybook's advocacy of{' '}
            <a
              href="https://www.componentdriven.org/"
              className="text-sky-600 underline"
            >
              Component Driven Development
            </a>{' '}
            (I'm a fan)
          </li>
          <li>Vite and Vitest (long-time follower, first-time user)</li>
        </ul>

        <div className="flex flex-wrap place-content-evenly">
          <a
            href="app/"
            className="m-4 inline-block cursor-pointer rounded bg-sky-600 py-3 px-6 font-bold text-white"
          >
            Launch the app ➞
          </a>
          <a
            href="storybook/"
            className="m-4 inline-block cursor-pointer rounded bg-sky-600 py-3 px-6 font-bold text-white"
          >
            View the Storybook ➞
          </a>
        </div>
      </div>
    </div>
  </React.StrictMode>,
)
