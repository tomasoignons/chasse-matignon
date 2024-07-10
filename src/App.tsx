import { act, useEffect, useState } from 'react'
import deputesData from "./deputes.json";
import './App.css';
import { Tweet } from 'react-tweet'


interface Deputy {
  name: string;
  parti: string;
  circonscription: string;
  img: string;
  propose: boolean;
  tweet: string;
}

function App() {
  const [proposedDeputies, setProposedDeputies] = useState<Deputy[]>([]);
  const [nonProposedDeputies, setNonProposedDeputies] = useState<Deputy[]>([]);
  const [actualDeputy, setActualDeputy] = useState<Deputy>();
  const [displayResult, setDisplayResult] = useState<boolean>(false);
  const [actualListe, setActualListe] = useState<Number>(0);
  const [nameToFilterOut, setNameToFilterOut] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  useEffect(() => {
    const nameToFilterOut = localStorage.getItem('nameToFilterOut')?.split(',') || []
    setNameToFilterOut(nameToFilterOut)
    const score = parseInt(localStorage.getItem('score') || "0")
    setScore(score)
    const filteredDeputies = deputesData.filter((depute) => {
      return !nameToFilterOut.includes(depute.name)
    })
    // Function to shuffle an array
    function shuffleArray(array : Deputy[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
    }

    // Shuffle the filteredDeputies array
    shuffleArray(filteredDeputies);

    const propose = filteredDeputies.filter((depute) => {
      return depute.propose
    })
    const nonPropose = filteredDeputies.filter((depute) => {
      return !depute.propose
    })
    setProposedDeputies(propose)
    setNonProposedDeputies(nonPropose)
    setActualDeputy(propose[0])
  }, [])

  const result = (response : boolean) => {
    //stocker le député courant dans le local storage
    if(response === actualDeputy?.propose){
      let score = parseInt(localStorage.getItem('score') || "0")
      score++
      localStorage.setItem('score', score.toString())
      setScore(score)
    }
    if(actualDeputy){
      nameToFilterOut.push(actualDeputy.name)
      localStorage.setItem('nameToFilterOut', nameToFilterOut.join(','))
    }
    setDisplayResult(true)
  }

  const nextDeputy = () => {
    //enlever le député de la liste des députés
    setDisplayResult(false)
    let newProposedDeputies : Deputy[] = [...proposedDeputies]
    let newNonProposedDeputies : Deputy[] = [...nonProposedDeputies]
    if(actualListe === 0){
      newProposedDeputies = proposedDeputies.filter((depute) => {
        return depute.name !== actualDeputy?.name
      })
      setProposedDeputies(newProposedDeputies)      
    } else {
      newNonProposedDeputies = nonProposedDeputies.filter((depute) => {
        return depute.name !== actualDeputy?.name
      })
      setNonProposedDeputies(newNonProposedDeputies)      
    }
    //choisir un député aléatoire dans la liste
    let randomList = Math.floor(Math.random() * 2)
    if (newProposedDeputies.length === 0 && newNonProposedDeputies.length === 0){
      randomList = 2
    } else if (newProposedDeputies.length === 0){
      randomList = 1
    } else if (newNonProposedDeputies.length === 0){
      randomList = 0
    }
    setActualListe(randomList)
    if(randomList === 0){
      const randomDeputy = newProposedDeputies[Math.floor(Math.random() * newProposedDeputies.length)]
      setActualDeputy(randomDeputy)
    } else if (randomList === 1){
      const randomDeputy = newNonProposedDeputies[Math.floor(Math.random() * newNonProposedDeputies.length)]
      setActualDeputy(randomDeputy)
    } else {
      setActualDeputy(undefined)
      setDisplayResult(true)
    }
  }

  const reset = () => {
    localStorage.setItem('nameToFilterOut', "")
    localStorage.setItem("score", "0")
    window.location.reload()
  }
  return (
    <>
      <div className='main flex justify-center items-center'>
        <div className='absolute top-5 left-5'>
          <h1 className='text-3xl font-bold card'>Score : {score}</h1>
        </div>
        <div className='absolute top-5 right-5 w-40 flex justify-center'>
          <button className='btn' onClick={() => reset()}>Recommencer</button>
        </div>
        {(actualDeputy && !displayResult) && (
          <div className='flex gap-10 items-center'>
            <div className='card w-44 pt-10 pb-10 cursor-pointer shadow' onClick={() => result(false)}>
              <p className='text-5xl text-center'>NON</p>
            </div>
            <div className='card' style={{width : "300px"}}>
              <img className='object-cover rounded-lg' src={actualDeputy.img} alt={actualDeputy.name} />
              <h2 className='mt-5 text-center text-xl font-bold'>{actualDeputy.name}</h2>
              <p className='text-center text-sm'>{actualDeputy.parti}</p>
            </div>
            <div className='card w-44 pt-10 pb-10 cursor-pointer shadow' onClick={() => result(true)}>
              <p className='text-5xl text-center'>OUI</p>
            </div>
          </div>
        )}
        {(actualDeputy && displayResult) && (
          <div className='flex flex-col gap-4 items-center card'>
            <h2 className='text-2xl font-bold h-1/6'>La réponse est {actualDeputy.propose? "Oui" : "Non"}</h2>
            {actualDeputy.tweet !== "" && (
              <div className='flex h-100 overflow-y-hidden'>
                <Tweet id={actualDeputy?.tweet.split('/')[actualDeputy?.tweet.split('/').length - 1]} />
              </div>
            )}
            <button className='btn h-1/6' onClick={() => nextDeputy()}>Suivant</button>
          </div>
        )}
        {(!actualDeputy && displayResult) && (
          <div className='flex flex-col gap-4 items-center card'>
            <h2 className='text-2xl font-bold'>Fin de la liste</h2>
            <button className='btn' onClick={() => reset()}>Recommencer</button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
