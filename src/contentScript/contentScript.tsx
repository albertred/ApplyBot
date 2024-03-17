import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Card } from '@material-ui/core'
import WeatherCard from '../components/WeatherCard'
import { getStoredOptions, LocalStorageOptions } from '../utils/storage'
import { Messages } from '../utils/messages'
import './contentScript.css'

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)
  const [isActive, setIsActive] = useState<boolean>(false)

  useEffect(() => {
    getStoredOptions().then((options) => {
      setOptions(options)
      setIsActive(options.hasAutoOverlay)
    })
  }, [])

  const handleMessages = (msg: Messages) => {
    if (msg === Messages.TOGGLE_OVERLAY) {
      setIsActive(!isActive)
    }
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessages)
    return () => {
      // clean up event listener, bug fix from: https://www.udemy.com/course/chrome-extension/learn/#questions/14694484/
      chrome.runtime.onMessage.removeListener(handleMessages)
    }
  }, [isActive])

  if (!options) {
    return null
  }

  return (
    <>
      {isActive && (
        <Card className="overlayCard">
          <WeatherCard
            city={options.homeCity}
            tempScale={options.tempScale}
            onDelete={() => setIsActive(false)}
          />
        </Card>
      )}
    </>
  )
}

const isElementVisible = (element: Element): boolean => {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

const getVisibleInputValues = () : HTMLInputElement[] => {
  const inputs = document.querySelectorAll('input')
  const visibleInputs = Array.from(inputs).filter(isElementVisible)
  const elements = visibleInputs.map(input => input as HTMLInputElement)
  return elements
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)

console.log('>>> Running contentScript.tsx...')

const levenshteinDistance = (s1, s2) => {
  // Create an array to save distances
  const distances = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

  // Fill the first row and column
  for (let i = 0; i <= s1.length; i += 1) distances[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) distances[j][0] = j;

  // Calculate distances
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      distances[j][i] = Math.min(
        distances[j][i - 1] + 1, // Deletion
        distances[j - 1][i] + 1, // Insertion
        distances[j - 1][i - 1] + indicator, // Substitution
      );
    }
  }

  // The distance between the two strings is in the bottom-right corner
  return distances[s2.length][s1.length];
}

const distance = (s1: string, s2: string) => {
  const e1 = s1 ? s1.toUpperCase().trim() : ''
  const e2 = s2 ? s2.toUpperCase().trim() : ''
  const b = s1.length + s2.length
  return b ? levenshteinDistance(e1, e2) / b : 0
}

const captureFields = () => {
  console.log('>>> captureFields...')
  getVisibleInputValues().forEach(element => {
    console.log('>>> ', element.value)
  })
}

const handleMessages = (msg: Messages) => {
  console.log('>>> message received in contentScript: ', msg)
  if (msg === Messages.CAPTURE) {
    captureFields()
  }
}

console.log('>>>> test1', distance('Name', 'Name (optional)'))
console.log('>>>> test1', distance('Name', 'Sex'))

chrome.runtime.onMessage.addListener(handleMessages)
