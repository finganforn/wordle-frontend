
import { useState } from "react";

const alphabets = {
  en: "abcdefghijklmnopqrstuvwxyz".split(""),
  sv: "abcdefghijklmnopqrstuvwxyzåäö".split("")
};






import { useEffect } from "react";




export default function App() {
	
  const [wordLength, setWordLength] = useState(5);
  const [darkMode, setDarkMode] = useState(false);  
  const [currentWord, setCurrentWord] = useState(
    Array(5).fill("")
);	
	
  
  const [requiredPairs, setRequiredPairs] = useState([]);
  const [excludedLetters, setExcludedLetters] = useState("");
  const [maxSeconds, setMaxSeconds] = useState(20);
  const [lang, setLang] = useState("en");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const theme = {
	background: darkMode ? "#121212" : "#ffffff",
	text: darkMode ? "#e0e0e0" : "#000000",
	tileBackground: darkMode ? "#1e1e1e" : "#ffffff",
	border: darkMode ? "#555" : "#ccc"
	};
  
  useEffect(() => {
    setCurrentWord(Array(wordLength).fill(""));
    setRequiredPairs([]);
  }, [wordLength]);
  
  useEffect(() => {
	  document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
	}, [darkMode]);

  const addRequiredPair = () => {
    setRequiredPairs([...requiredPairs, { letter: "", wrongIndex: 0 }]);
  };

  const updatePair = (index, key, value) => {
    const updated = [...requiredPairs];
    updated[index][key] = value;
    setRequiredPairs(updated);
  };

  const removePair = (index) => {
    setRequiredPairs(requiredPairs.filter((_, i) => i !== index));
  };

  const buildPayload = () => {
  const activeAlphabet = alphabets[lang];

  const allowedLetters = activeAlphabet.filter(
    (letter) => !excludedLetters.includes(letter)
  );

  return {
    currentWord: currentWord.map(c => c || " ").join(""),
    allowedLetters,
    requiredLetters: requiredPairs.map(p => p.letter),
    requiredLetterWrongIndices: requiredPairs.map(p => Number(p.wrongIndex)),
    maxSeconds: Number(maxSeconds),
    lang
  };
};

  const solve = async () => {
    const payload = buildPayload();

    setLoading(true);

    try {
		
		if (requiredPairs.some(p => p.wrongIndex >= wordLength)) {
		  alert("Invalid required letter position for current word length");
		  return;
		}

		if (currentWord.length !== wordLength) {
		  alert("Grid mismatch");
			return;
		}
		
		
      const res = await fetch("/api/solve", {
	  //const res = await fetch("http://192.168.100.22:8080/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setResults(data.words || []);
    } catch (err) {
      alert("API error 3");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
	  style={{
		padding: "20px 40px",
		//backgroundColor: theme.background,
		color: theme.text,
		minHeight: "100vh",
		fontFamily: "Arial"
	  }}
	>
	
	  <div style={{ marginBottom: "20px" }}>
		  <label style={{ cursor: "pointer" }}>
			<input
			  type="checkbox"
			  checked={darkMode}
			  onChange={(e) => setDarkMode(e.target.checked)}
			  style={{ marginRight: "8px" }}
			/>
			Dark Mode
		  </label>
		</div>
	
	 
	
      <h1>Erik's Wordle Solver</h1>
	  
	  <h3>Word Length</h3>
	  
	  <input
	  type="number"
	  min="2"
	  max="15"
	  value={wordLength}
	  onChange={(e) => setWordLength(Number(e.target.value))}
	  />

      <h3>Green Letters</h3>
      <div
		  style={{
			display: "grid",
			gridTemplateColumns: `repeat(${wordLength}, 1fr)`,
			gap: "8px",
			marginBottom: "20px"
		  }}
		>
  {currentWord.map((letter, i) => (
    <input
      key={i}
      maxLength={1}
      value={letter}
      onChange={(e) => {
        const updated = [...currentWord];
        updated[i] = e.target.value.toLocaleLowerCase(lang);
        setCurrentWord(updated);
          }}
          //style={styles.tile}
		  style={{
			  width: "40px",
			  height: "40px",
			  textAlign: "center",
			  fontSize: "18px",
			  backgroundColor: theme.tileBackground,
			  color: theme.text,
			  border: `1px solid ${theme.border}`
			}}
        />
      ))}
	  </div>

      <h3>Required Letters (Yellow)</h3>
      {requiredPairs.map((pair, index) => (
        <div key={index} style={styles.pairRow}>
          <input
            maxLength={1}
            placeholder="Letter"
            value={pair.letter}
            onChange={(e) =>
              updatePair(index, "letter", e.target.value.toLocaleLowerCase(lang))
            }
          />
		  
          <select
		value={pair.wrongIndex}
		onChange={(e) =>
			updatePair(index, "wrongIndex", e.target.value)
		}
		>
		{Array.from({ length: wordLength }, (_, pos) => (
			<option key={pos} value={pos}>
			Not in position {pos+1}
			</option>
		))}
		</select>
		  
          <button onClick={() => removePair(index)}>X</button>
        </div>
      ))}
      <button onClick={addRequiredPair}>+ Add Required Letter</button>

      <h3>Excluded Letters (Gray)</h3>
      <input
        placeholder="e.g. qwerty"
        value={excludedLetters}
        onChange={(e) => setExcludedLetters(e.target.value.toLocaleLowerCase(lang))}
      />

      <h3>Settings</h3>
      <div style={{ marginTop: "15px" }}>
		  <label htmlFor="maxSeconds" style={{ marginRight: "10px" }}>
			Max Seconds:
		  </label>
		  <input
			id="maxSeconds"
			type="number"
			min="1"
			max="300"
			value={maxSeconds}
			onChange={(e) => setMaxSeconds(Number(e.target.value))}
			style={{ width: "80px" }}
		  />
		</div>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="sv">Swedish</option>
      </select>

      <button onClick={solve} style={styles.solveBtn}>
        Solve
      </button>

      {loading && <p>Solving...</p>}

      <ul>
        {results.map((word, i) => (
          <li key={i}>{word}</li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
	padding: "20px 40px",
    maxWidth: "600px",
	minHeight: "100vh",
    margin: "40px auto",
    fontFamily: "Arial"
  },
  
  tile: {
    width: "50px",
    height: "50px",
    textAlign: "center",
    fontSize: "20px"
  },
  pairRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  },
  solveBtn: {
    marginTop: "20px",
    padding: "10px"
  }
};